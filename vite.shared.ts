import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { UserConfig } from 'vite';

export interface SharedViteOptions {
  entry?: string | Record<string, string>;
  esbuild?: { jsx: string; jsxImportSource: string };
  vanillaExtract?: boolean;
  /** 输出格式，默认仅 ESM；需要被 CJS 宿主（如 NestJS）引用的包传 ['es', 'cjs'] */
  formats?: Array<'es' | 'cjs'>;
}

const BASE_EXTERNALS = ['react', 'react-dom', 'react/jsx-runtime'];

export async function createViteConfig(options: SharedViteOptions = {}): Promise<UserConfig> {
  const { entry = 'src/index.ts', vanillaExtract = true, esbuild, formats = ['es'] } = options;

  const dts = (await import('unplugin-dts/vite')).default;
  const plugins: UserConfig['plugins'] = [];

  if (vanillaExtract) {
    const { vanillaExtractPlugin } = await import('@vanilla-extract/vite-plugin');
    plugins.push(vanillaExtractPlugin());
  }

  plugins.push(dts({ entryRoot: 'src', outDir: 'dist', tsconfigPath: './tsconfig.json' }));

  const cwd = process.cwd();
  const isMap = typeof entry !== 'string';
  const libEntry = isMap
    ? Object.fromEntries(Object.entries(entry).map(([k, v]) => [k, path.resolve(cwd, v)]))
    : path.resolve(cwd, entry);

  const pkg = JSON.parse(readFileSync(path.resolve(cwd, 'package.json'), 'utf8'));
  const depNames = new Set([
    ...BASE_EXTERNALS,
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]);

  const rollupExternal = (id: string) => {
    if (id.startsWith('node:')) return true;
    if (id[0] === '.' || id[0] === '/' || id[0] === '\0') return false;
    if (depNames.has(id)) return true;
    const slashIdx = id.indexOf('/');
    if (slashIdx > 0) {
      const pkgName =
        id[0] === '@' ? id.slice(0, id.indexOf('/', slashIdx + 1)) : id.slice(0, slashIdx);
      return pkgName ? depNames.has(pkgName) : false;
    }
    return false;
  };

  return {
    plugins,
    ...(esbuild && { esbuild }),
    build: {
      lib: { entry: libEntry },
      rollupOptions: {
        external: rollupExternal,
        // 显式 output 数组：rolldown 下 lib.fileName 钩子拿不到 outputOptions.format，
        // 会导致 CJS 内容也写成 .mjs，因此每种格式单独声明 entryFileNames。
        output: formats.map((format) => {
          const ext = format === 'cjs' ? 'cjs' : 'mjs';
          return {
            format,
            preserveModules: false,
            entryFileNames: (chunkInfo: { name: string }) =>
              isMap ? `${chunkInfo.name}.${ext}` : `index.${ext}`,
            chunkFileNames: `[name].${ext}`,
          };
        }),
      },
      cssCodeSplit: false,
      minify: false,
      cssMinify: true,
      target: 'es2020',
    },
  };
}

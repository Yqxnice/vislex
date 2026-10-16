import { renderMermaidSVG, type RenderOptions } from 'beautiful-mermaid';

/**
 * Mermaid 渲染引擎（同步优先 + 异步兜底）。与编辑器 plugins/mermaid/render.ts 同源。
 *
 * 没有任何一个引擎能同时做到「同步渲染 + 支持全部图表类型」，因此采用双引擎：
 * - 同步引擎 beautiful-mermaid：零 DOM 依赖，可在 useMemo 中直接出 SVG，
 *   覆盖 流程图 / 状态图 / 序列图 / 类图 / ER 图 / XY 图 六类；
 * - 异步引擎 官方 mermaid：覆盖其余类型（甘特图 / 饼图 / gitGraph / 旅程图 /
 *   思维导图 / 时间线），需要 DOM 且必须 await，因此按需动态加载。
 *
 * 策略：先试同步引擎，抛错（不支持的类型）再落到异步引擎；两者都失败则回显源码。
 * 注意：官方 mermaid 对无换行的单行图表源码会抛解析错误，传入代码必须保留原始换行
 * （此处仅 trim 首尾空白，不动内部换行）。
 */

/** 传给 beautiful-mermaid 的颜色全部用 CSS 变量，暗色主题无需 JS 参与切换 */
const COLORS: RenderOptions = {
  bg: 'var(--vislex-surface-muted, #f9fafb)',
  fg: 'var(--vislex-text, #1f2937)',
  line: 'var(--vislex-border-strong, #d1d5db)',
  accent: 'var(--vislex-brand, #2563eb)',
  muted: 'var(--vislex-text-muted, #9ca3af)',
  surface: 'var(--vislex-code-bg, #f3f4f6)',
  border: 'var(--vislex-border, #e5e7eb)',
  transparent: true,
};

/** 渲染结果缓存：key 为 引擎 + 主题 + 源码 */
const MAX_CACHE = 200;
const svgCache = new Map<string, string>();

function cached(key: string, produce: () => string): string {
  const hit = svgCache.get(key);
  if (hit !== undefined) return hit;
  const svg = produce();
  if (svgCache.size >= MAX_CACHE) {
    svgCache.delete(svgCache.keys().next().value as string);
  }
  svgCache.set(key, svg);
  return svg;
}

/** 同步渲染：不支持的类型（或语法错误）返回 null，由调用方落异步引擎 */
export function renderMermaidSync(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed) return null;
  try {
    return cached(`sync:${trimmed}`, () => renderMermaidSVG(trimmed, COLORS));
  } catch {
    return null;
  }
}

/** 官方 mermaid 单例：只在首次需要异步兜底时加载，避免拖累首屏体积 */
let mermaidPromise: Promise<typeof import('mermaid')> | null = null;

function loadMermaid(): Promise<typeof import('mermaid')> {
  if (!mermaidPromise) mermaidPromise = import('mermaid');
  return mermaidPromise;
}

/** 官方 mermaid 的 render 需要一个全局唯一 id */
let renderSeq = 0;

/** 异步渲染：覆盖 beautiful-mermaid 不支持的类型，失败时抛出错误信息 */
export async function renderMermaidAsync(code: string, dark: boolean): Promise<string> {
  const trimmed = code.trim();
  if (!trimmed) throw new Error('图表源码为空');
  const key = `async:${dark ? 'dark' : 'light'}:${trimmed}`;
  const hit = svgCache.get(key);
  if (hit !== undefined) return hit;

  const mermaid = (await loadMermaid()).default;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: dark ? 'dark' : 'default',
  });
  const { svg } = await mermaid.render(`vislex-mermaid-${++renderSeq}`, trimmed);
  if (svgCache.size >= MAX_CACHE) {
    svgCache.delete(svgCache.keys().next().value as string);
  }
  svgCache.set(key, svg);
  return svg;
}

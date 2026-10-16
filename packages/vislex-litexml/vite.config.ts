import { createViteConfig } from '../../vite.shared.ts';

export default createViteConfig({
  entry: 'src/index.ts',
  vanillaExtract: false,
  formats: ['es', 'cjs'],
});

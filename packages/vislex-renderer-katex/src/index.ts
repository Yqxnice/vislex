import type { VislexRendererModule } from '@vislex/renderer';

import { MathRenderer } from './MathRenderer.js';

export { MathRenderer } from './MathRenderer.js';
export { renderMath } from './renderMath.js';

/** KaTeX 渲染模块：composeRenderer({ modules: [katexRendererModule] }) */
export const katexRendererModule: VislexRendererModule = {
  name: 'katex',
  renderers: {
    Math: MathRenderer,
  },
};

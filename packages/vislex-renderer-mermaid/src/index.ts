import type { VislexRendererModule } from '@vislex/renderer';

import { MermaidRenderer } from './MermaidRenderer.js';

export { MermaidRenderer } from './MermaidRenderer.js';
export { renderMermaidAsync, renderMermaidSync } from './render.js';

/** Mermaid 渲染模块：composeRenderer({ modules: [mermaidRendererModule] }) */
export const mermaidRendererModule: VislexRendererModule = {
  name: 'mermaid',
  renderers: {
    Mermaid: MermaidRenderer,
  },
};

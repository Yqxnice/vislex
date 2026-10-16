import type { VislexRendererModule } from '@vislex/renderer';

import { CodeBlockRenderer } from './CodeBlockRenderer.js';

export { CodeBlockRenderer } from './CodeBlockRenderer.js';
export { highlightCode } from './highlight.js';
export { resolveLanguage } from './languages.js';

/** 代码块渲染模块：composeRenderer({ modules: [codeBlockRendererModule] }) */
export const codeBlockRendererModule: VislexRendererModule = {
  name: 'codeblock',
  renderers: {
    CodeBlock: CodeBlockRenderer,
  },
};

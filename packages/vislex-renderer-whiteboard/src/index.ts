import type { VislexRendererModule } from '@vislex/renderer';

import { WhiteboardRenderer } from './WhiteboardRenderer.js';

export { WhiteboardRenderer } from './WhiteboardRenderer.js';
export { WhiteboardStorageProvider, useWhiteboardStorage } from './storage.js';
export type { WhiteboardStorage } from './storage.js';
export { parseScene, resolveDeltaScene, stringifyScene } from './scene.js';
export type { WhiteboardElement, WhiteboardScene } from './scene.js';

/** 白板渲染模块：composeRenderer({ modules: [whiteboardRendererModule] }) */
export const whiteboardRendererModule: VislexRendererModule = {
  name: 'whiteboard',
  renderers: {
    Whiteboard: WhiteboardRenderer,
  },
};

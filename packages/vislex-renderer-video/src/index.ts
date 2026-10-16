import type { VislexRendererModule } from '@vislex/renderer';

import { VideoRenderer } from './VideoRenderer.js';

export { VideoRenderer } from './VideoRenderer.js';

/** 视频块渲染模块：composeRenderer({ modules: [videoRendererModule] }) */
export const videoRendererModule: VislexRendererModule = {
  name: 'video',
  renderers: {
    Video: VideoRenderer,
  },
};

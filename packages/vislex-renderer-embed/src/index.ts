import type { VislexRendererModule } from '@vislex/renderer';

import { EmbedRenderer } from './EmbedRenderer.js';

export { EmbedRenderer } from './EmbedRenderer.js';

/** 嵌入块渲染模块：composeRenderer({ modules: [embedRendererModule] }) */
export const embedRendererModule: VislexRendererModule = {
  name: 'embed',
  renderers: {
    Embed: EmbedRenderer,
  },
};

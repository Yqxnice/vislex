import type { VislexRendererModule } from '@vislex/renderer';

import { LinkCardRenderer } from './LinkCardRenderer.js';

export { LinkCardRenderer } from './LinkCardRenderer.js';

/** 链接卡片渲染模块：composeRenderer({ modules: [linkCardRendererModule] }) */
export const linkCardRendererModule: VislexRendererModule = {
  name: 'linkcard',
  renderers: {
    LinkCard: LinkCardRenderer,
  },
};

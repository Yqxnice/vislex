import type { VislexRendererModule } from '@vislex/renderer';

import { RubyRenderer } from './RubyRenderer.js';

export { RubyRenderer } from './RubyRenderer.js';

/** Ruby 注音渲染模块：composeRenderer({ modules: [rubyRendererModule] }) */
export const rubyRendererModule: VislexRendererModule = {
  name: 'ruby',
  renderers: {
    Ruby: RubyRenderer,
  },
};

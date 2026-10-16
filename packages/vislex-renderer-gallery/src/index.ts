import type { VislexRendererModule } from '@vislex/renderer';

import { GalleryRenderer } from './GalleryRenderer.js';

export { GalleryRenderer } from './GalleryRenderer.js';
export { GalleryLightbox } from './GalleryLightbox.js';

/** 图库渲染模块：composeRenderer({ modules: [galleryRendererModule] }) */
export const galleryRendererModule: VislexRendererModule = {
  name: 'gallery',
  renderers: {
    Gallery: GalleryRenderer,
  },
};

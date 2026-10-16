/**
 * 图库 Markdown 转换器：编辑器侧注入可编辑的 GalleryEditNode，
 * 转换逻辑的唯一实现位于 @vislex/headless（createGalleryTransformers 工厂）。
 */

import { createGalleryTransformers } from '@vislex/headless';
import { $createGalleryEditNode } from './GalleryEditNode.js';
import { $isGalleryNode, GalleryNode, normalizeGalleryLayout } from './GalleryNode.js';

export const GALLERY_TRANSFORMERS = createGalleryTransformers({
  GalleryNode,
  createGalleryNode: $createGalleryEditNode,
  isGalleryNode: $isGalleryNode,
  normalizeLayout: normalizeGalleryLayout,
});

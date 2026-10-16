/**
 * Banner Markdown 转换器：编辑器侧薄封装（Banner 无独立 Edit 节点）。
 * 转换逻辑的唯一实现位于 @vislex/headless（createBannerTransformers 工厂）。
 */

import { createBannerTransformers } from '@vislex/headless';
import { $createBannerNode, $isBannerNode, BannerNode } from './BannerNode.js';

export const BANNER_TRANSFORMERS = createBannerTransformers({
  BannerNode,
  createBannerNode: $createBannerNode,
  isBannerNode: $isBannerNode,
});

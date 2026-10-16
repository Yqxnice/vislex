/**
 * Link Card Markdown 转换器：编辑器侧薄封装。
 * LinkCard 无独立 Edit 节点（展示即静态卡片），直接复用 @vislex/headless
 * 的 createLinkCardTransformers 工厂并注入本包 LinkCardNode。
 */

import { createLinkCardTransformers } from '@vislex/headless';
import { $createLinkCardNode, $isLinkCardNode, LinkCardNode } from './LinkCardNode.js';

export const LINKCARD_TRANSFORMERS = createLinkCardTransformers({
  LinkCardNode,
  createLinkCardNode: $createLinkCardNode,
  isLinkCardNode: $isLinkCardNode,
});

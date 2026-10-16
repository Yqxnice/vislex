/**
 * 嵌入 Markdown 转换器：编辑器侧注入可编辑的 EmbedEditNode，
 * 转换逻辑的唯一实现位于 @vislex/headless（createEmbedTransformers 工厂）。
 */

import { createEmbedTransformers } from '@vislex/headless';
import { $createEmbedEditNode } from './EmbedEditNode.js';
import { $isEmbedNode, EmbedNode } from './EmbedNode.js';

export const EMBED_TRANSFORMERS = createEmbedTransformers({
  EmbedNode,
  createEmbedNode: $createEmbedEditNode,
  isEmbedNode: $isEmbedNode,
});

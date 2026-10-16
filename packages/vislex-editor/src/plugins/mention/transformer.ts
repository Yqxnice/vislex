/**
 * Mention Markdown 转换器：编辑器侧注入可编辑的 MentionEditNode，
 * 转换逻辑的唯一实现位于 @vislex/headless（createMentionTransformers 工厂）。
 */

import { createMentionTransformers } from '@vislex/headless';
import { $createMentionEditNode, $isMentionNode, MentionNode } from './MentionNode.js';

export const MENTION_TRANSFORMERS = createMentionTransformers({
  MentionNode,
  createMentionNode: $createMentionEditNode,
  isMentionNode: $isMentionNode,
});

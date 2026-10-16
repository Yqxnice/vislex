/**
 * 白板 Markdown 转换器：编辑器侧注入可编辑的 WhiteboardEditNode，
 * 转换逻辑的唯一实现位于 @vislex/headless（createWhiteboardTransformers 工厂）。
 */

import { createWhiteboardTransformers } from '@vislex/headless';
import { $createWhiteboardEditNode } from './WhiteboardEditNode.js';
import { $isWhiteboardNode, WhiteboardNode } from './WhiteboardNode.js';

export const WHITEBOARD_TRANSFORMERS = createWhiteboardTransformers({
  WhiteboardNode,
  createWhiteboardNode: $createWhiteboardEditNode,
  isWhiteboardNode: $isWhiteboardNode,
});

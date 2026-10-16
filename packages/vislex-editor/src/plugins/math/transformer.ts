/**
 * 数学公式 Markdown 转换器：编辑器侧注入可编辑的 Edit 节点，
 * 转换逻辑的唯一实现位于 @vislex/headless（createMathTransformers 工厂）。
 * 守卫用 base 节点的 $is*Node（按节点 type 字符串判定，Edit 节点同 type 可命中）。
 */

import { createMathTransformers } from '@vislex/headless';
import {
  $createBlockMathEditNode,
  $createInlineMathEditNode,
  $isBlockMathNode,
  $isInlineMathNode,
  BlockMathEditNode,
  InlineMathEditNode,
} from './nodes.js';

export const MATH_TRANSFORMERS = createMathTransformers({
  InlineMathNode: InlineMathEditNode,
  BlockMathNode: BlockMathEditNode,
  createInlineMathNode: $createInlineMathEditNode,
  createBlockMathNode: $createBlockMathEditNode,
  isInlineMathNode: $isInlineMathNode,
  isBlockMathNode: $isBlockMathNode,
});

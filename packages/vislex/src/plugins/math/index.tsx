import { createCommand } from 'lexical';
import { $createParagraphNode, $getRoot, $getSelection, $isRangeSelection } from 'lexical';
import { Sigma, SquareSigma } from 'lucide-react';
import type { EditorPlugin } from '../../types';
import { $createBlockMathNode, $isBlockMathNode, BlockMathNode, $createInlineMathNode, $isInlineMathNode, InlineMathNode } from './nodes';
import { MATH_TRANSFORMERS } from './transformer';

/**
 * 通知某个公式节点打开编辑模态框。
 * 工具栏插入空公式后派发，MathComponent 监听并打开自身模态框。
 */
export const OPEN_MATH_MODAL_COMMAND = createCommand<{ nodeKey: string }>('OPEN_MATH_MODAL');

/**
 * KaTeX 数学公式（行内 + 块级）。
 * - 行内：$equation$，点击公式可编辑；
 * - 块级：$$ equation $$，右上角「编辑」按钮；
 * - 工具栏：有选中文本时把选中文本当作 LaTeX 包成行内公式；否则插入空公式并打开编辑框。
 */
export const mathPlugin: EditorPlugin = {
  name: 'math',
  nodes: [InlineMathNode, BlockMathNode],
  transformers: MATH_TRANSFORMERS,
  toolbar: [
    {
      id: 'inlineMath',
      label: <Sigma size={16} />,
      title: '行内公式',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return $isInlineMathNode(selection.anchor.getNode());
      },
      run: (editor) => {
        let pendingKey: string | null = null;
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          const selectedText = selection.getTextContent();
          const node = $createInlineMathNode(selectedText);
          selection.insertNodes([node]);
          pendingKey = node.getKey();
          // 空公式时稍后打开编辑框；有选中文本则直接作为公式内容
          if (selectedText.trim().length === 0) {
            // 标记由下方 setTimeout 派发命令
          }
        });
        if (pendingKey) {
          setTimeout(() => editor.dispatchCommand(OPEN_MATH_MODAL_COMMAND, { nodeKey: pendingKey! }), 0);
        }
      },
    },
    {
      id: 'blockMath',
      label: <SquareSigma size={16} />,
      title: '块级公式',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return $isBlockMathNode(selection.anchor.getNode().getTopLevelElement());
      },
      run: (editor) => {
        let pendingKey: string | null = null;
        editor.update(() => {
          const selection = $getSelection();
          // 有光标时取所在顶层块；无光标则不依赖已选中内容
          const anchorBlock = $isRangeSelection(selection)
            ? selection.anchor.getNode().getTopLevelElement()
            : null;
          const block = anchorBlock && !$isBlockMathNode(anchorBlock) ? anchorBlock : null;
          const node = $createBlockMathNode(block ? block.getTextContent() : '');
          if (block) {
            block.replace(node);
          } else {
            $getRoot().append(node);
          }
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
          pendingKey = node.getKey();
        });
        if (pendingKey) {
          setTimeout(() => editor.dispatchCommand(OPEN_MATH_MODAL_COMMAND, { nodeKey: pendingKey! }), 0);
        }
      },
    },
  ],
};

export {
  $createInlineMathNode,
  $isInlineMathNode,
  InlineMathNode,
  type SerializedInlineMathNode,
  $createBlockMathNode,
  $isBlockMathNode,
  BlockMathNode,
  type SerializedBlockMathNode,
} from './nodes';
export { MATH_TRANSFORMERS } from './transformer';

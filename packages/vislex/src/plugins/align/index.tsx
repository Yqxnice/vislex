import {
  $findMatchingParent,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  type ElementFormatType,
  type ElementNode,
} from 'lexical';
import type { ReactNode } from 'react';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from 'lucide-react';
import type { EditorPlugin, ToolbarItem } from '../../types';
import { ALIGN_TRANSFORMERS } from './transformer';

const ICON_SIZE = 16;

type AlignFormat = 'left' | 'center' | 'right' | 'justify';

/** 选区锚点所在的最内层块级元素的对齐方式（取不到视为默认左对齐） */
function $getCurrentBlockFormat(): ElementFormatType {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return '';
  const block = $findMatchingParent(
    selection.anchor.getNode(),
    (node): node is ElementNode => $isElementNode(node) && !node.isInline(),
  );
  return block ? block.getFormatType() : '';
}

function alignButton(id: string, label: ReactNode, title: string, format: AlignFormat): ToolbarItem {
  return {
    id,
    label,
    title,
    isActive: () => {
      const current = $getCurrentBlockFormat();
      // left 是默认态：空 / left / start 都视为左对齐
      return format === 'left' ? current === '' || current === 'left' || current === 'start' : current === format;
    },
    run: (editor) => {
      const current = editor.read($getCurrentBlockFormat);
      // 再次点击已激活的对齐方式时退回左对齐（默认态）
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, current === format ? 'left' : format);
    },
  };
}

/**
 * 块级对齐：左 / 居中 / 右 / 两端对齐。
 * 作用于段落、标题、引用等块级元素（Lexical 原生 element format），
 * Markdown 往返以块尾 ` {:align}` 标记保留（见 ./transformer.ts）。
 */
export const alignPlugin: EditorPlugin = {
  name: 'align',
  toolbar: [
    alignButton('alignLeft', <AlignLeft size={ICON_SIZE} />, '左对齐', 'left'),
    alignButton('alignCenter', <AlignCenter size={ICON_SIZE} />, '居中对齐', 'center'),
    alignButton('alignRight', <AlignRight size={ICON_SIZE} />, '右对齐', 'right'),
    alignButton('alignJustify', <AlignJustify size={ICON_SIZE} />, '两端对齐', 'justify'),
  ],
  transformers: ALIGN_TRANSFORMERS,
};

export {
  ALIGN_HEADING_TRANSFORMER,
  ALIGN_QUOTE_TRANSFORMER,
  ALIGN_PARAGRAPH_TRANSFORMER,
  ALIGN_TRANSFORMERS,
} from './transformer';

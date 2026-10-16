import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
} from '@lexical/rich-text';
import { $createParagraphNode, $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical';
import type { TextFormatType } from 'lexical';
import type { ReactNode } from 'react';
import { Bold, Code, Heading1, Heading2, Italic, Strikethrough, TextQuote } from 'lucide-react';
import type { EditorPlugin, ToolbarItem } from '../types';

const ICON_SIZE = 16;

type BlockKind = 'h1' | 'h2' | 'quote';

/** 选区所在的顶层块（段落 / 标题 / 引用） */
function $getTopLevelBlock() {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  return selection.anchor.getNode().getTopLevelElement();
}

function $isBlockKindOf(kind: BlockKind): boolean {
  const block = $getTopLevelBlock();
  if (!block) return false;
  if (kind === 'quote') return $isQuoteNode(block);
  return $isHeadingNode(block) && block.getTag() === kind;
}

/** 在「段落 ↔ 标题/引用」之间切换，已是目标类型时退回段落 */
function $toggleBlockKind(kind: BlockKind): void {
  const block = $getTopLevelBlock();
  if (!block) return;

  const next =
    $isBlockKindOf(kind)
      ? $createParagraphNode()
      : kind === 'quote'
        ? $createQuoteNode()
        : $createHeadingNode(kind);

  // 先把子节点迁到新块，再整体替换原块
  for (const child of block.getChildren()) {
    next.append(child);
  }
  block.replace(next);
}

function formatButton(id: string, label: ReactNode, title: string, format: TextFormatType): ToolbarItem {
  return {
    id,
    label,
    title,
    isActive: () => {
      const selection = $getSelection();
      return $isRangeSelection(selection) && selection.hasFormat(format);
    },
    run: (editor) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format),
  };
}

function blockButton(id: string, label: ReactNode, title: string, kind: BlockKind): ToolbarItem {
  return {
    id,
    label,
    title,
    isActive: () => $isBlockKindOf(kind),
    run: (editor) => editor.update(() => $toggleBlockKind(kind)),
  };
}

/** 基础富文本：行内格式 + 标题 + 引用 */
export const richTextPlugin: EditorPlugin = {
  name: 'rich-text',
  nodes: [HeadingNode, QuoteNode],
  toolbar: [
    formatButton('bold', <Bold size={ICON_SIZE} />, '加粗', 'bold'),
    formatButton('italic', <Italic size={ICON_SIZE} />, '斜体', 'italic'),
    formatButton('strikethrough', <Strikethrough size={ICON_SIZE} />, '删除线', 'strikethrough'),
    formatButton('inlineCode', <Code size={ICON_SIZE} />, '行内代码', 'code'),
    blockButton('h1', <Heading1 size={ICON_SIZE} />, '一级标题', 'h1'),
    blockButton('h2', <Heading2 size={ICON_SIZE} />, '二级标题', 'h2'),
    blockButton('quote', <TextQuote size={ICON_SIZE} />, '引用', 'quote'),
  ],
};

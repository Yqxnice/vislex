import { $createParagraphNode, type ElementNode, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import { $createEmbedNode, $isEmbedNode, EmbedNode } from './EmbedNode';

/**
 * 嵌入 Markdown 往返。
 *
 * 格式：:::embed <url>
 *
 * 单行（与 linkcard 同形态）；标题不进 Markdown（仅编辑器内维护）。
 *
 * 服务端 core 内有一份同构副本（格式需保持一致）。
 */

const EMBED_START_REGEX = /^[ \t]*:::embed\s+(\S+)\s*$/i;
const EMBED_END_REGEX = /^[ \t]*:::[ \t]*$/;

const embedTransformer: MultilineElementTransformer = {
  type: 'multiline-element',
  dependencies: [EmbedNode],
  regExpStart: EMBED_START_REGEX,
  regExpEnd: { optional: true, regExp: EMBED_END_REGEX },

  export: (node: LexicalNode) => {
    if (!$isEmbedNode(node)) return null;
    return `:::embed ${node.getSrc()}\n:::`;
  },

  replace: (
    rootNode: ElementNode,
    children: LexicalNode[] | null,
    startMatch: string[],
    _endMatch: string[] | null,
    _linesInBetween: string[] | null,
    isImport: boolean,
  ) => {
    const src = startMatch[1]?.trim() ?? '';
    if (!src) return false;

    if (!isImport && children) {
      // 输入快捷键：把当前段落替换成嵌入，光标落到新段落
      const node = $createEmbedNode(src);
      rootNode.replace(node);
      const paragraph = $createParagraphNode();
      node.insertAfter(paragraph);
      paragraph.select();
      return true;
    }

    // 导入
    const node = $createEmbedNode(src);
    rootNode.append(node);
    return true;
  },
};

export const EMBED_TRANSFORMERS: MultilineElementTransformer[] = [embedTransformer];

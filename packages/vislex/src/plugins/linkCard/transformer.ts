import { $createParagraphNode, type ElementNode, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import { $createLinkCardNode, $isLinkCardNode, LinkCardNode } from './LinkCardNode';

/**
 * Link Card Markdown 往返。
 *
 * 格式：:::linkcard https://example.com/some/url
 *       :::
 *
 * 单行也支持（与 gallery 不同，linkcard 无需内部内容）：
 *   :::linkcard https://example.com/some/url
 *
 * 服务端 core 内有一份同构副本（格式需保持一致）。
 */

const LINKCARD_START_REGEX = /^[ \t]*:::linkcard\s+(\S+)\s*$/i;
const LINKCARD_END_REGEX = /^[ \t]*:::[ \t]*$/;

const linkcardTransformer: MultilineElementTransformer = {
  type: 'multiline-element',
  dependencies: [LinkCardNode],
  regExpStart: LINKCARD_START_REGEX,
  regExpEnd: { optional: true, regExp: LINKCARD_END_REGEX },

  export: (node: LexicalNode) => {
    if (!$isLinkCardNode(node)) return null;
    return `:::linkcard ${node.getUrl()}\n:::`;
  },

  replace: (
    rootNode: ElementNode,
    children: LexicalNode[] | null,
    startMatch: string[],
    _endMatch: string[] | null,
    _linesInBetween: string[] | null,
    isImport: boolean,
  ) => {
    const url = startMatch[1]?.trim() ?? '';
    if (!url) return false;

    if (!isImport && children) {
      // 输入快捷键：把当前段落替换成 linkcard，光标落到新段落
      const node = $createLinkCardNode(url);
      rootNode.replace(node);
      const paragraph = $createParagraphNode();
      node.insertAfter(paragraph);
      paragraph.select();
      return true;
    }

    // 导入
    const node = $createLinkCardNode(url);
    rootNode.append(node);
    return true;
  },
};

export const LINKCARD_TRANSFORMERS: MultilineElementTransformer[] = [linkcardTransformer];

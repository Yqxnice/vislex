/**
 * Link Card Markdown 转换器（headless / editor 共用单一实现）。
 * 通过 createLinkCardTransformers(deps) 注入当前环境注册的节点类。
 *
 * 格式：:::linkcard https://example.com/some/url
 *       :::
 *
 * 单行也支持（与 gallery 不同，linkcard 无需内部内容）。
 */

import { $createParagraphNode, type ElementNode, type Klass, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import type { LinkCardNode } from './linkcard.node.js';
import {
  $createLinkCardNode,
  $isLinkCardNode,
  LinkCardNode as HeadlessLinkCardNode,
} from './linkcard.node.js';

const LINKCARD_START_REGEX = /^[ \t]*:::linkcard\s+(\S+)\s*$/i;
const LINKCARD_END_REGEX = /^[ \t]*:::[ \t]*$/;

export interface LinkCardTransformersDeps {
  LinkCardNode: Klass<LexicalNode>;
  createLinkCardNode: (url: string) => LexicalNode;
  isLinkCardNode: (node: LexicalNode | null | undefined) => boolean;
}

export function createLinkCardTransformers(
  deps: LinkCardTransformersDeps,
): MultilineElementTransformer[] {
  const linkcardTransformer: MultilineElementTransformer = {
    type: 'multiline-element',
    dependencies: [deps.LinkCardNode],
    regExpStart: LINKCARD_START_REGEX,
    regExpEnd: { optional: true, regExp: LINKCARD_END_REGEX },

    export: (node: LexicalNode) => {
      if (!deps.isLinkCardNode(node)) return null;
      return `:::linkcard ${(node as LinkCardNode).getUrl()}\n:::`;
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

      // 输入快捷键：把当前段落替换成 linkcard，光标落到新段落
      if (!isImport && children) {
        const node = deps.createLinkCardNode(url);
        rootNode.replace(node);
        const paragraph = $createParagraphNode();
        node.insertAfter(paragraph);
        paragraph.select();
        return true;
      }

      // 导入
      rootNode.append(deps.createLinkCardNode(url));
      return true;
    },
  };

  return [linkcardTransformer];
}

/** headless 默认绑定（零 React 节点） */
export const LINKCARD_TRANSFORMERS: MultilineElementTransformer[] = createLinkCardTransformers({
  LinkCardNode: HeadlessLinkCardNode,
  createLinkCardNode: $createLinkCardNode,
  isLinkCardNode: $isLinkCardNode,
});

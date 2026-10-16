/**
 * 嵌入 Markdown 转换器（headless / editor 共用单一实现）。
 * 通过 createEmbedTransformers(deps) 注入当前环境注册的节点类。
 *
 * 格式：:::embed <url>
 *
 * 单行（与 linkcard 同形态）；标题不进 Markdown（仅编辑器内维护）。
 */

import { $createParagraphNode, type ElementNode, type Klass, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import type { EmbedNode } from './embed.node.js';
import { $createEmbedNode, $isEmbedNode, EmbedNode as HeadlessEmbedNode } from './embed.node.js';

const EMBED_START_REGEX = /^[ \t]*:::embed\s+(\S+)\s*$/i;
const EMBED_END_REGEX = /^[ \t]*:::[ \t]*$/;

export interface EmbedTransformersDeps {
  EmbedNode: Klass<LexicalNode>;
  createEmbedNode: (src: string) => LexicalNode;
  isEmbedNode: (node: LexicalNode | null | undefined) => boolean;
}

export function createEmbedTransformers(deps: EmbedTransformersDeps): MultilineElementTransformer[] {
  const embedTransformer: MultilineElementTransformer = {
    type: 'multiline-element',
    dependencies: [deps.EmbedNode],
    regExpStart: EMBED_START_REGEX,
    regExpEnd: { optional: true, regExp: EMBED_END_REGEX },

    export: (node: LexicalNode) => {
      if (!deps.isEmbedNode(node)) return null;
      return `:::embed ${(node as EmbedNode).getSrc()}\n:::`;
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

      const node = deps.createEmbedNode(src);

      if (!isImport && children) {
        // 输入快捷键：把当前段落替换成嵌入，光标落到新段落
        rootNode.replace(node);
        const paragraph = $createParagraphNode();
        node.insertAfter(paragraph);
        paragraph.select();
        return true;
      }

      // 导入
      rootNode.append(node);
      return true;
    },
  };

  return [embedTransformer];
}

/** headless 默认绑定（零 React 节点） */
export const EMBED_TRANSFORMERS: MultilineElementTransformer[] = createEmbedTransformers({
  EmbedNode: HeadlessEmbedNode,
  createEmbedNode: $createEmbedNode,
  isEmbedNode: $isEmbedNode,
});

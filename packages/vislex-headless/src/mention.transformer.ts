/**
 * Mention Markdown 转换器（headless / editor 共用单一实现）。
 * 通过 createMentionTransformers(deps) 注入当前环境注册的节点类。
 *
 * 格式：[@名字](mention:id)
 * 无 ID 时：[@名字](mention)
 *
 * 节点文本以 @ 开头（@名字），导出时去掉 @ 还原为链接文本「名字」。
 * 注意：必须排在内置 LINK 转换器之前，否则会被当成普通链接吞掉。
 */

import type { Klass, LexicalNode, TextNode } from 'lexical';
import type { TextMatchTransformer } from '@lexical/markdown';
import type { MentionNode } from './mention.node.js';
import {
  $createMentionNode,
  $isMentionNode,
  MentionNode as HeadlessMentionNode,
} from './mention.node.js';

const MENTION_REGEXP = /\[@([^\]]+)\]\(mention(?::([^\s)]+))?\)/;

export interface MentionTransformersDeps {
  MentionNode: Klass<LexicalNode>;
  createMentionNode: (name: string, mentionId?: string) => LexicalNode;
  isMentionNode: (node: LexicalNode | null | undefined) => boolean;
}

export function createMentionTransformers(deps: MentionTransformersDeps): TextMatchTransformer[] {
  const mentionTransformer: TextMatchTransformer = {
    type: 'text-match',
    dependencies: [deps.MentionNode],
    // @lexical/markdown 0.52 的 MarkdownShortcuts 按 trigger 字符对 text-match
    // 转换器建索引（indexBy 跳过无 trigger 的项），语法以 ) 收尾，必须声明。
    trigger: ')',
    regExp: MENTION_REGEXP,
    importRegExp: MENTION_REGEXP,
    replace: (textNode: TextNode, match: RegExpMatchArray) => {
      const name = match[1];
      const id = match[2];
      textNode.replace(deps.createMentionNode(name, id || undefined));
    },
    export: (node: LexicalNode) => {
      if (!deps.isMentionNode(node)) return null;
      const text = (node as MentionNode).getTextContent().replace(/^@/, '');
      if (!text) return null;
      const id = (node as MentionNode).getMentionId();
      return `[@${text}](mention${id ? `:${id}` : ''})`;
    },
  };

  return [mentionTransformer];
}

/** headless 默认绑定（零 React 节点） */
export const MENTION_TRANSFORMERS: TextMatchTransformer[] = createMentionTransformers({
  MentionNode: HeadlessMentionNode,
  createMentionNode: $createMentionNode,
  isMentionNode: $isMentionNode,
});

import type { LexicalNode, TextNode } from 'lexical';
import type { TextMatchTransformer } from '@lexical/markdown';
import { $createMentionNode, $isMentionNode, MentionNode } from './MentionNode';

/**
 * Mention Markdown 往返。
 *
 * 格式：[@名字](mention:id)
 * 无 ID 时：[@名字](mention)
 *
 * 节点文本以 @ 开头（@名字），导出时去掉 @ 还原为链接文本「名字」。
 * 注意：必须排在内置 LINK 转换器之前，否则会被当成普通链接吞掉。
 *
 * 服务端 core 内有一份同构副本（格式需保持一致）。
 */

const MENTION_REGEXP = /\[@([^\]]+)\]\(mention(?::([^\s)]+))?\)/;

const mentionTransformer: TextMatchTransformer = {
  type: 'text-match',
  dependencies: [MentionNode],
  regExp: MENTION_REGEXP,
  importRegExp: MENTION_REGEXP,
  replace: (textNode: TextNode, match: RegExpMatchArray) => {
    const name = match[1];
    const id = match[2];
    const node = $createMentionNode(name, id || undefined);
    textNode.replace(node);
  },
  export: (node: LexicalNode) => {
    if (!$isMentionNode(node)) return null;
    const text = node.getTextContent().replace(/^@/, '');
    if (!text) return null;
    const id = node.getMentionId();
    return `[@${text}](mention${id ? `:${id}` : ''})`;
  },
};

export const MENTION_TRANSFORMERS: TextMatchTransformer[] = [mentionTransformer];

import type { LexicalNode, TextNode } from 'lexical';
import type { TextMatchTransformer } from '@lexical/markdown';
import { $createRubyNode, $isRubyNode, RubyNode } from './RubyNode';

/**
 * Ruby 注音 Markdown 往返。
 *
 * 格式：<ruby>base<rt>rt</rt></ruby>
 * 与 LiteXML 的 ruby 行内标签同语法（零学习成本），任何允许内联 HTML 的
 * Markdown 渲染器都能原样展示。
 *
 * 服务端 core 内有一份同构副本（格式需保持一致）。
 */

const RUBY_REGEXP = /<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/;

const rubyTransformer: TextMatchTransformer = {
  type: 'text-match',
  dependencies: [RubyNode],
  regExp: RUBY_REGEXP,
  importRegExp: RUBY_REGEXP,
  replace: (textNode: TextNode, match: RegExpMatchArray) => {
    const node = $createRubyNode(match[1], match[2]);
    textNode.replace(node);
  },
  export: (node: LexicalNode) => {
    if (!$isRubyNode(node)) return null;
    return `<ruby>${node.getBase()}<rt>${node.getRt()}</rt></ruby>`;
  },
};

export const RUBY_TRANSFORMERS: TextMatchTransformer[] = [rubyTransformer];

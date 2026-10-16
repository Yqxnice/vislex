/**
 * Ruby 注音 Markdown 转换器（headless / editor 共用单一实现）。
 * 通过 createRubyTransformers(deps) 注入当前环境注册的节点类。
 *
 * 格式：<ruby>base<rt>rt</rt></ruby>
 * 与 LiteXML 的 ruby 行内标签同语法（零学习成本），任何允许内联 HTML 的
 * Markdown 渲染器都能原样展示。
 */

import type { Klass, LexicalNode, TextNode } from 'lexical';
import type { TextMatchTransformer } from '@lexical/markdown';
import type { RubyNode } from './ruby.node.js';
import { $createRubyNode, $isRubyNode, RubyNode as HeadlessRubyNode } from './ruby.node.js';

const RUBY_REGEXP = /<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/;

export interface RubyTransformersDeps {
  RubyNode: Klass<LexicalNode>;
  createRubyNode: (base: string, rt: string) => LexicalNode;
  isRubyNode: (node: LexicalNode | null | undefined) => boolean;
}

export function createRubyTransformers(deps: RubyTransformersDeps): TextMatchTransformer[] {
  const rubyTransformer: TextMatchTransformer = {
    type: 'text-match',
    dependencies: [deps.RubyNode],
    // @lexical/markdown 0.52 的 MarkdownShortcuts 按 trigger 字符对 text-match
    // 转换器建索引（indexBy 跳过无 trigger 的项），语法以 > 收尾，必须声明。
    trigger: '>',
    regExp: RUBY_REGEXP,
    importRegExp: RUBY_REGEXP,
    replace: (textNode: TextNode, match: RegExpMatchArray) => {
      textNode.replace(deps.createRubyNode(match[1], match[2]));
    },
    export: (node: LexicalNode) => {
      if (!deps.isRubyNode(node)) return null;
      const n = node as RubyNode;
      return `<ruby>${n.getBase()}<rt>${n.getRt()}</rt></ruby>`;
    },
  };

  return [rubyTransformer];
}

/** headless 默认绑定（零 React 节点） */
export const RUBY_TRANSFORMERS: TextMatchTransformer[] = createRubyTransformers({
  RubyNode: HeadlessRubyNode,
  createRubyNode: $createRubyNode,
  isRubyNode: $isRubyNode,
});

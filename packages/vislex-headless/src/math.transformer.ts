/**
 * 数学公式 Markdown 转换器（headless / editor 共用单一实现）。
 *
 * 通过 createMathTransformers(deps) 注入当前环境注册的节点类：
 * - @vislex/headless 注入零 React 的 headless 节点；
 * - @vislex/editor 注入可编辑的 Edit 节点（type 字符串一致）。
 *
 * 行内：$equation$
 * 块级：
 * $$
 * equation
 * $$
 *
 * 公式内容原样保留（含换行），不做转义。
 */

import { $createParagraphNode, type ElementNode, type Klass, type LexicalNode, type TextNode } from 'lexical';
import type { MultilineElementTransformer, TextMatchTransformer } from '@lexical/markdown';
import type { BlockMathNode } from './math-block.node.js';
import type { InlineMathNode } from './math-inline.node.js';
import {
  $createBlockMathNode,
  $isBlockMathNode,
  BlockMathNode as HeadlessBlockMathNode,
} from './math-block.node.js';
import {
  $createInlineMathNode,
  $isInlineMathNode,
  InlineMathNode as HeadlessInlineMathNode,
} from './math-inline.node.js';

const INLINE_MATH_REGEXP = /\$([^$\n]+?)\$/;

export interface MathTransformersDeps {
  InlineMathNode: Klass<LexicalNode>;
  BlockMathNode: Klass<LexicalNode>;
  createInlineMathNode: (equation: string) => LexicalNode;
  createBlockMathNode: (equation: string) => LexicalNode;
  isInlineMathNode: (node: LexicalNode | null | undefined) => boolean;
  isBlockMathNode: (node: LexicalNode | null | undefined) => boolean;
}

export function createMathTransformers(
  deps: MathTransformersDeps,
): Array<TextMatchTransformer | MultilineElementTransformer> {
  /** 行内公式转换器：$...$ → InlineMathNode */
  const inlineMathTransformer: TextMatchTransformer = {
    type: 'text-match',
    dependencies: [deps.InlineMathNode],
    regExp: INLINE_MATH_REGEXP,
    importRegExp: INLINE_MATH_REGEXP,
    trigger: '$',
    replace: (textNode: TextNode, match: RegExpMatchArray) => {
      const node = deps.createInlineMathNode(match[1]);
      textNode.replace(node);
    },
    export: (node: LexicalNode) => {
      if (!deps.isInlineMathNode(node)) return null;
      return `$${(node as InlineMathNode).getEquation()}$`;
    },
  };

  const BLOCK_MATH_START = /^[ \t]*\$\$\s*$/;
  const BLOCK_MATH_END = /^[ \t]*\$\$\s*$/;

  /** 块级公式转换器：$$ ... $$ → BlockMathNode */
  const blockMathTransformer: MultilineElementTransformer = {
    type: 'multiline-element',
    dependencies: [deps.BlockMathNode],
    regExpStart: BLOCK_MATH_START,
    regExpEnd: { optional: true, regExp: BLOCK_MATH_END },

    export: (node: LexicalNode) => {
      if (!deps.isBlockMathNode(node)) return null;
      return `$$\n${(node as BlockMathNode).getEquation()}\n$$`;
    },

    replace: (
      rootNode: ElementNode,
      _children: LexicalNode[] | null,
      _startMatch: string[],
      _endMatch: string[] | null,
      linesInBetween: string[] | null,
      isImport: boolean,
    ) => {
      if (!linesInBetween) {
        // 输入快捷键：$$ + 空格 触发，插入空块级公式
        if (!isImport) {
          const node = deps.createBlockMathNode('');
          rootNode.replace(node);
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
        }
        return true;
      }
      const lines = [...linesInBetween];
      if (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
      while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) lines.pop();
      const equation = lines.join('\n');
      rootNode.append(deps.createBlockMathNode(equation));
      return true;
    },
  };

  return [blockMathTransformer, inlineMathTransformer];
}

/** headless 默认绑定（零 React 节点） */
export const MATH_TRANSFORMERS: Array<TextMatchTransformer | MultilineElementTransformer> =
  createMathTransformers({
    InlineMathNode: HeadlessInlineMathNode,
    BlockMathNode: HeadlessBlockMathNode,
    createInlineMathNode: $createInlineMathNode,
    createBlockMathNode: $createBlockMathNode,
    isInlineMathNode: $isInlineMathNode,
    isBlockMathNode: $isBlockMathNode,
  });

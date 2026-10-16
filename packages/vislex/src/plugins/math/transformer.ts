import { $createParagraphNode, type ElementNode, type LexicalNode, type TextNode } from 'lexical';
import type { MultilineElementTransformer, TextMatchTransformer } from '@lexical/markdown';
import { $createBlockMathNode, $isBlockMathNode, BlockMathNode, $createInlineMathNode, $isInlineMathNode, InlineMathNode } from './nodes';

/**
 * 数学公式 Markdown 往返。
 *
 * 行内：$equation$
 * 块级：
 * $$
 * equation
 * $$
 *
 * 公式内容原样保留（含换行），不做转义。
 */

const INLINE_MATH_REGEXP = /\$([^$\n]+?)\$/;

/** 行内公式转换器：$...$ → InlineMathNode */
const inlineMathTransformer: TextMatchTransformer = {
  type: 'text-match',
  dependencies: [InlineMathNode],
  regExp: INLINE_MATH_REGEXP,
  importRegExp: INLINE_MATH_REGEXP,
  trigger: '$',
  replace: (textNode: TextNode, match: RegExpMatchArray) => {
    const equation = match[1];
    const node = $createInlineMathNode(equation);
    textNode.replace(node);
  },
  export: (node: LexicalNode) => {
    if (!$isInlineMathNode(node)) return null;
    return `$${node.getEquation()}$`;
  },
};

const BLOCK_MATH_START = /^[ \t]*\$\$\s*$/;
const BLOCK_MATH_END = /^[ \t]*\$\$\s*$/;

/** 块级公式转换器：$$ ... $$ → BlockMathNode */
const blockMathTransformer: MultilineElementTransformer = {
  type: 'multiline-element',
  dependencies: [BlockMathNode],
  regExpStart: BLOCK_MATH_START,
  regExpEnd: { optional: true, regExp: BLOCK_MATH_END },

  export: (node: LexicalNode) => {
    if (!$isBlockMathNode(node)) return null;
    return `$$\n${node.getEquation()}\n$$`;
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
        const node = $createBlockMathNode('');
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
    rootNode.append($createBlockMathNode(equation));
    return true;
  },
};

export const MATH_TRANSFORMERS: Array<TextMatchTransformer | MultilineElementTransformer> = [
  blockMathTransformer,
  inlineMathTransformer,
];

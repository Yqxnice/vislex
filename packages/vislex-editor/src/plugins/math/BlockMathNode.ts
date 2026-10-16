import { DecoratorNode, type EditorConfig, type LexicalEditor, type LexicalNode, type SerializedLexicalNode, type Spread } from 'lexical';
import type { JSX } from 'react';
import { createRendererDecoration } from '../../renderer/RendererWrapper.js';
import { nodeBlock } from './math.css';

export type SerializedBlockMathNode = Spread<
  { equation: string },
  SerializedLexicalNode
>;

/**
 * 块级数学公式节点（DecoratorNode，block，static 版）。
 * 数据只有 equation（LaTeX 源码），displayMode 渲染；
 * 静态渲染走 RendererConfig 的 Math 槽位（KaTeX 由 @vislex/renderer-katex
 * 在 compose 时注入），节点本体不引用 katex。
 */
export class BlockMathNode extends DecoratorNode<JSX.Element> {
  __equation: string;

  static getType(): string {
    return 'math-block';
  }

  static clone(node: BlockMathNode): BlockMathNode {
    return new BlockMathNode(node.__equation, node.__key);
  }

  static importJSON(serialized: SerializedBlockMathNode): BlockMathNode {
    return $createBlockMathNode(serialized.equation ?? '').updateFromJSON(serialized);
  }

  exportJSON(): SerializedBlockMathNode {
    return {
      ...super.exportJSON(),
      equation: this.getEquation(),
    };
  }

  constructor(equation?: string, key?: string) {
    super(key);
    this.__equation = equation ?? '';
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement('div');
    div.className = nodeBlock;
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getEquation(): string {
    return this.getLatest().__equation;
  }

  setEquation(equation: string): this {
    const writable = this.getWritable();
    writable.__equation = equation;
    return writable;
  }

  getTextContent(): string {
    return this.getLatest().__equation;
  }

  decorate(_editor: LexicalEditor): JSX.Element {
    return createRendererDecoration('Math', undefined, {
      equation: this.getEquation(),
      displayMode: true,
    });
  }
}

export function $createBlockMathNode(equation?: string): BlockMathNode {
  return new BlockMathNode(equation);
}

export function $isBlockMathNode(node: LexicalNode | null | undefined): node is BlockMathNode {
  return node instanceof BlockMathNode;
}

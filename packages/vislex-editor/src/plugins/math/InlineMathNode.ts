import { DecoratorNode, type EditorConfig, type LexicalEditor, type LexicalNode, type SerializedLexicalNode, type Spread } from 'lexical';
import type { JSX } from 'react';
import { createRendererDecoration } from '../../renderer/RendererWrapper.js';
import { nodeInline } from './math.css';

export type SerializedInlineMathNode = Spread<
  { equation: string },
  SerializedLexicalNode
>;

/**
 * 行内数学公式节点（DecoratorNode，inline，static 版）。
 * 数据只有 equation（LaTeX 源码）；静态渲染走 RendererConfig 的 Math 槽位
 * （KaTeX 由 @vislex/renderer-katex 在 compose 时注入），节点本体不引用 katex。
 */
export class InlineMathNode extends DecoratorNode<JSX.Element> {
  __equation: string;

  static getType(): string {
    return 'math-inline';
  }

  static clone(node: InlineMathNode): InlineMathNode {
    return new InlineMathNode(node.__equation, node.__key);
  }

  static importJSON(serialized: SerializedInlineMathNode): InlineMathNode {
    return $createInlineMathNode(serialized.equation ?? '').updateFromJSON(serialized);
  }

  exportJSON(): SerializedInlineMathNode {
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
    const span = document.createElement('span');
    span.className = nodeInline;
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return true;
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
      displayMode: false,
    });
  }
}

export function $createInlineMathNode(equation?: string): InlineMathNode {
  return new InlineMathNode(equation);
}

export function $isInlineMathNode(node: LexicalNode | null | undefined): node is InlineMathNode {
  return node instanceof InlineMathNode;
}

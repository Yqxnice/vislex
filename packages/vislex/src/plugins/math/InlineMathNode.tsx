import { DecoratorNode, type EditorConfig, type LexicalEditor, type LexicalNode, type SerializedLexicalNode, type Spread } from 'lexical';
import type { JSX } from 'react';
import { MathComponent } from './MathComponent';

export type SerializedInlineMathNode = Spread<
  { equation: string },
  SerializedLexicalNode
>;

/**
 * 行内数学公式节点（DecoratorNode，inline）。
 * 数据只有 equation（LaTeX 源码），渲染交由 MathComponent 用 KaTeX 输出。
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
    span.className = 'inline-block align-middle';
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

  decorate(editor: LexicalEditor): JSX.Element {
    return (
      <MathComponent
        nodeKey={this.getKey()}
        equation={this.getEquation()}
        displayMode={false}
        editable={editor.isEditable()}
      />
    );
  }
}

export function $createInlineMathNode(equation?: string): InlineMathNode {
  return new InlineMathNode(equation);
}

export function $isInlineMathNode(node: LexicalNode | null | undefined): node is InlineMathNode {
  return node instanceof InlineMathNode;
}

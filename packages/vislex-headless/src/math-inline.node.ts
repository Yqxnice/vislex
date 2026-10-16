/**
 * InlineMathNode 的 headless 同构副本。
 *
 * 与 packages/vislex/src/plugins/math/InlineMathNode.tsx 保持同步：
 * type 名（math-inline）与 JSON 序列化格式（{equation: string}）必须一致。
 */

import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

export type SerializedInlineMathNode = Spread<
  { equation: string },
  SerializedLexicalNode
>;

export class InlineMathNode extends DecoratorNode<never> {
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
    if (typeof document === 'undefined') {
      throw new Error('InlineMathNode.createDOM 不应在服务端被调用');
    }
    const span = document.createElement('span');
    span.className = 'vislex-math-inline-wrap';
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

  decorate(): never {
    throw new Error('InlineMathNode.decorate 不应在服务端被调用');
  }
}

export function $createInlineMathNode(equation?: string): InlineMathNode {
  return new InlineMathNode(equation);
}

export function $isInlineMathNode(node: LexicalNode | null | undefined): node is InlineMathNode {
  return node instanceof InlineMathNode;
}

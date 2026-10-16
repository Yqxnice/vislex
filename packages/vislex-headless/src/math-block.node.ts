/**
 * BlockMathNode 的 headless 同构副本。
 *
 * 与 packages/vislex/src/plugins/math/BlockMathNode.tsx 保持同步：
 * type 名（math-block）与 JSON 序列化格式（{equation: string}）必须一致。
 */

import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

export type SerializedBlockMathNode = Spread<
  { equation: string },
  SerializedLexicalNode
>;

export class BlockMathNode extends DecoratorNode<never> {
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
    if (typeof document === 'undefined') {
      throw new Error('BlockMathNode.createDOM 不应在服务端被调用');
    }
    const div = document.createElement('div');
    div.className = 'vislex-math-block-wrap';
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

  decorate(): never {
    throw new Error('BlockMathNode.decorate 不应在服务端被调用');
  }
}

export function $createBlockMathNode(equation?: string): BlockMathNode {
  return new BlockMathNode(equation);
}

export function $isBlockMathNode(node: LexicalNode | null | undefined): node is BlockMathNode {
  return node instanceof BlockMathNode;
}

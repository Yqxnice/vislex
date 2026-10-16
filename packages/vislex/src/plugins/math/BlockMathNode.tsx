import { DecoratorNode, type EditorConfig, type LexicalEditor, type LexicalNode, type SerializedLexicalNode, type Spread } from 'lexical';
import type { JSX } from 'react';
import { MathComponent } from './MathComponent';

export type SerializedBlockMathNode = Spread<
  { equation: string },
  SerializedLexicalNode
>;

/**
 * 块级数学公式节点（DecoratorNode，block）。
 * 数据只有 equation（LaTeX 源码），displayMode 渲染。
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
    div.className = 'block my-3';
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

  decorate(editor: LexicalEditor): JSX.Element {
    return (
      <MathComponent
        nodeKey={this.getKey()}
        equation={this.getEquation()}
        displayMode={true}
        editable={editor.isEditable()}
      />
    );
  }
}

export function $createBlockMathNode(equation?: string): BlockMathNode {
  return new BlockMathNode(equation);
}

export function $isBlockMathNode(node: LexicalNode | null | undefined): node is BlockMathNode {
  return node instanceof BlockMathNode;
}

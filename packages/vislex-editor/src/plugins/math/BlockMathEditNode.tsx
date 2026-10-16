import type { LexicalEditor, LexicalNode } from 'lexical';
import type { JSX } from 'react';
import { MathComponent } from './MathComponent.js';
import { BlockMathNode, type SerializedBlockMathNode } from './BlockMathNode.js';

/** 编辑态块级公式节点：与 BlockMathNode 共享 type，点击可打开编辑模态框 */
export class BlockMathEditNode extends BlockMathNode {
  // Lexical 0.52 要求具体节点类自带 own static getType（否则 DEV 告警）
  static getType(): string {
    return 'math-block';
  }

  static clone(node: BlockMathEditNode): BlockMathEditNode {
    return new BlockMathEditNode(node.__equation, node.__key);
  }

  static importJSON(serialized: SerializedBlockMathNode): BlockMathEditNode {
    return $createBlockMathEditNode(serialized.equation ?? '').updateFromJSON(serialized);
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

export function $createBlockMathEditNode(equation?: string): BlockMathEditNode {
  return new BlockMathEditNode(equation);
}

export function $isBlockMathEditNode(node: LexicalNode | null | undefined): node is BlockMathEditNode {
  return node instanceof BlockMathEditNode;
}

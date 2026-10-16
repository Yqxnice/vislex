import type { LexicalEditor, LexicalNode } from 'lexical';
import type { JSX } from 'react';
import { MathComponent } from './MathComponent.js';
import { InlineMathNode, type SerializedInlineMathNode } from './InlineMathNode.js';

/** 编辑态行内公式节点：与 InlineMathNode 共享 type，点击可打开编辑模态框 */
export class InlineMathEditNode extends InlineMathNode {
  // Lexical 0.52 要求具体节点类自带 own static getType（否则 DEV 告警）
  static getType(): string {
    return 'math-inline';
  }

  static clone(node: InlineMathEditNode): InlineMathEditNode {
    return new InlineMathEditNode(node.__equation, node.__key);
  }

  static importJSON(serialized: SerializedInlineMathNode): InlineMathEditNode {
    return $createInlineMathEditNode(serialized.equation ?? '').updateFromJSON(serialized);
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

export function $createInlineMathEditNode(equation?: string): InlineMathEditNode {
  return new InlineMathEditNode(equation);
}

export function $isInlineMathEditNode(node: LexicalNode | null | undefined): node is InlineMathEditNode {
  return node instanceof InlineMathEditNode;
}

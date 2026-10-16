import type { LexicalNode } from 'lexical';
import type { JSX } from 'react';
import { MermaidComponent } from './MermaidComponent.js';
import { MermaidNode, type SerializedMermaidNode } from './MermaidNode.js';

/** 编辑态 Mermaid 节点：与 MermaidNode 共享 type 字符串，decorate 交给组件跟踪编辑器可编辑态 */
export class MermaidEditNode extends MermaidNode {
  // Lexical 0.52 要求具体节点类自带 own static getType（否则 DEV 告警）
  static getType(): string {
    return 'mermaid';
  }

  static clone(node: MermaidEditNode): MermaidEditNode {
    return new MermaidEditNode(node.__code, node.__key);
  }

  static importJSON(serialized: SerializedMermaidNode): MermaidEditNode {
    return $createMermaidEditNode(serialized.code ?? '').updateFromJSON(serialized);
  }

  decorate(): JSX.Element {
    return <MermaidComponent nodeKey={this.getKey()} code={this.getCode()} />;
  }
}

export function $createMermaidEditNode(code?: string): MermaidEditNode {
  return new MermaidEditNode(code);
}

export function $isMermaidEditNode(
  node: LexicalNode | null | undefined,
): node is MermaidEditNode {
  return node instanceof MermaidEditNode;
}

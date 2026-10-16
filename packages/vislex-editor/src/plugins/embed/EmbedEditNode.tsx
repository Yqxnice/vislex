import type { LexicalNode } from 'lexical';
import type { JSX } from 'react';
import { EmbedComponent } from './EmbedComponent.js';
import { EmbedNode, type SerializedEmbedNode } from './EmbedNode.js';

function optionalString(raw: unknown): string | undefined {
  return typeof raw === 'string' && raw.trim() !== '' ? raw : undefined;
}

/** 编辑态嵌入节点：与 EmbedNode 共享 type 字符串，decorate 交给组件跟踪编辑器可编辑态 */
export class EmbedEditNode extends EmbedNode {
  // Lexical 0.52 要求具体节点类自带 own static getType（否则 DEV 告警）
  static getType(): string {
    return 'embed';
  }

  static clone(node: EmbedEditNode): EmbedEditNode {
    return new EmbedEditNode(node.__src, node.__title, node.__key);
  }

  static importJSON(serialized: SerializedEmbedNode): EmbedEditNode {
    return new EmbedEditNode(
      typeof serialized.src === 'string' ? serialized.src : '',
      optionalString(serialized.title),
    ).updateFromJSON(serialized);
  }

  decorate(): JSX.Element {
    return (
      <EmbedComponent
        nodeKey={this.getKey()}
        src={this.getSrc()}
        title={this.getTitle()}
      />
    );
  }
}

export function $createEmbedEditNode(src?: string): EmbedEditNode {
  return new EmbedEditNode(src);
}

export function $isEmbedEditNode(node: LexicalNode | null | undefined): node is EmbedEditNode {
  return node instanceof EmbedEditNode;
}

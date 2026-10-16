import type { LexicalNode } from 'lexical';
import type { JSX } from 'react';
import { WhiteboardComponent } from './WhiteboardComponent.js';
import {
  WhiteboardNode,
  type SerializedWhiteboardNode,
  type WhiteboardMode,
} from './WhiteboardNode.js';

/** 编辑态白板节点：与 WhiteboardNode 共享 type 字符串，decorate 交给组件跟踪编辑器可编辑态 */
export class WhiteboardEditNode extends WhiteboardNode {
  // Lexical 0.52 要求具体节点类自带 own static getType（否则 DEV 告警）
  static getType(): string {
    return 'whiteboard';
  }

  static clone(node: WhiteboardEditNode): WhiteboardEditNode {
    return new WhiteboardEditNode(
      node.__mode,
      node.__scene,
      node.__src,
      node.__patch,
      node.__key,
    );
  }

  static importJSON(serialized: SerializedWhiteboardNode): WhiteboardEditNode {
    return $createWhiteboardEditNode(
      serialized.mode ?? 'inline',
      serialized.scene ?? '',
      serialized.src ?? '',
      serialized.patch ?? '',
    ).updateFromJSON(serialized);
  }

  decorate(): JSX.Element {
    return (
      <WhiteboardComponent
        nodeKey={this.getKey()}
        mode={this.getMode()}
        scene={this.getScene()}
        src={this.getSrc()}
        patch={this.getPatch()}
      />
    );
  }
}

export function $createWhiteboardEditNode(
  mode?: WhiteboardMode,
  scene?: string,
  src?: string,
  patch?: string,
): WhiteboardEditNode {
  return new WhiteboardEditNode(mode, scene, src, patch);
}

export function $isWhiteboardEditNode(
  node: LexicalNode | null | undefined,
): node is WhiteboardEditNode {
  return node instanceof WhiteboardEditNode;
}

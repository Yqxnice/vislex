import type { LexicalEditor, LexicalNode } from 'lexical';
import type { JSX } from 'react';
import { RubyComponent } from './RubyComponent.js';
import { RubyNode, type SerializedRubyNode } from './RubyNode.js';

/**
 * 编辑器内使用的可编辑变体：与 RubyNode 共享 type 与序列化格式，
 * decorate 恢复传入 editor.isEditable()，点击可打开编辑模态框。
 */
export class RubyEditNode extends RubyNode {
  // Lexical 0.52 要求具体节点类自带 own static getType（否则 DEV 告警）
  static getType(): string {
    return 'ruby';
  }

  static clone(node: RubyEditNode): RubyEditNode {
    return new RubyEditNode(node.__base, node.__rt, node.__key);
  }

  static importJSON(serialized: SerializedRubyNode): RubyEditNode {
    return $createRubyEditNode(
      typeof serialized.base === 'string' ? serialized.base : '',
      typeof serialized.rt === 'string' ? serialized.rt : '',
    ).updateFromJSON(serialized);
  }

  decorate(editor: LexicalEditor): JSX.Element {
    return (
      <RubyComponent
        nodeKey={this.getKey()}
        base={this.getBase()}
        rt={this.getRt()}
        editable={editor.isEditable()}
      />
    );
  }
}

export function $createRubyEditNode(base?: string, rt?: string): RubyEditNode {
  return new RubyEditNode(base, rt);
}

export function $isRubyEditNode(node: LexicalNode | null | undefined): node is RubyEditNode {
  return node instanceof RubyEditNode;
}

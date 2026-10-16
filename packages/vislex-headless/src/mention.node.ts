/**
 * MentionNode 的 headless 同构副本。
 *
 * 与 packages/vislex/src/plugins/mention/MentionNode.tsx 保持同步：
 * type 名（mention）与 JSON 序列化格式（{text, mentionId?}）必须一致。
 */

import {
  TextNode,
  type EditorConfig,
  type LexicalNode,
  type SerializedTextNode,
  type Spread,
} from 'lexical';

export type SerializedMentionNode = Spread<
  {
    mentionId?: string;
  },
  SerializedTextNode
>;

export class MentionNode extends TextNode {
  __mentionId?: string;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__text, node.__mentionId, node.__key);
  }

  static importJSON(serialized: SerializedMentionNode): MentionNode {
    return $createMentionNode(serialized.text ?? '', serialized.mentionId).updateFromJSON(serialized);
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionId: this.getMentionId(),
    };
  }

  constructor(text: string, mentionId?: string, key?: string) {
    super(text, key);
    this.__mentionId = mentionId;
  }

  createDOM(config: EditorConfig): HTMLElement {
    if (typeof document === 'undefined') {
      throw new Error('MentionNode.createDOM 不应在服务端被调用');
    }
    const dom = super.createDOM(config);
    dom.className = 'vislex-mention';
    return dom;
  }

  getMentionId(): string | undefined {
    return this.getLatest().__mentionId;
  }

  setMentionId(mentionId: string | undefined): this {
    const writable = this.getWritable();
    writable.__mentionId = mentionId;
    return writable;
  }
}

/** 创建 mention 节点：name 不带 @ 时自动补前缀 */
export function $createMentionNode(name: string, mentionId?: string): MentionNode {
  const text = name.startsWith('@') ? name : `@${name}`;
  return new MentionNode(text, mentionId);
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode;
}

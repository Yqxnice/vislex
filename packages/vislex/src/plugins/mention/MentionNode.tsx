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

/**
 * Mention（@提及）节点：TextNode 子类，行内。
 * 文本始终以 @ 开头（如 @张三），mentionId 为可选的用户 ID。
 * 点击行为（打开编辑弹层）由 mentionPlugin 的 register 监听 CLICK_COMMAND 实现。
 *
 * 服务端 core 有同构副本，type 名（mention）与 JSON 格式必须一致。
 */
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
    const dom = super.createDOM(config);
    dom.className = 'rounded bg-vl-code-bg px-1 py-px font-medium text-vl-brand';
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

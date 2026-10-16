import {
  TextNode,
  type EditorConfig,
  type LexicalNode,
  type SerializedTextNode,
  type Spread,
} from 'lexical';
import { node } from './mention.css';

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
    dom.className = node;
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

/**
 * 编辑器内使用的可编辑变体：与 MentionNode 共享 type 与序列化格式。
 * 编辑交互（点击打开弹层）在插件层实现，节点行为与基类一致。
 */
export class MentionEditNode extends MentionNode {
  /**
   * 必须显式声明（继承自 MentionNode 的静态方法在此不足以让 Lexical 识别）：
   * Lexical 0.52 的 buildNodeClassRecord 对缺少 own getType 的类会做合成，
   * 而其类型值取自 prototype.$config() 记录的首个 key。MentionNode 未覆盖
   * TextNode 的 $config()（返回 { text: ... }），会导致合成出 "text"，
   * 覆盖内置 TextNode 注册项并使 mention 依赖校验失败。
   */
  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionEditNode): MentionEditNode {
    return new MentionEditNode(node.__text, node.__mentionId, node.__key);
  }

  static importJSON(serialized: SerializedMentionNode): MentionEditNode {
    return $createMentionEditNode(serialized.text ?? '', serialized.mentionId).updateFromJSON(serialized);
  }
}

/** 创建 mention 编辑节点：name 不带 @ 时自动补前缀 */
export function $createMentionEditNode(name: string, mentionId?: string): MentionEditNode {
  const text = name.startsWith('@') ? name : `@${name}`;
  return new MentionEditNode(text, mentionId);
}

export function $isMentionEditNode(node: LexicalNode | null | undefined): node is MentionEditNode {
  return node instanceof MentionEditNode;
}

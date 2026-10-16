/**
 * EmbedNode 的 headless 同构副本。
 *
 * 与 packages/vislex/src/plugins/embed/EmbedNode.tsx 保持同步：
 * type 名（embed）与 JSON 序列化格式（{src, title?}）必须一致。
 */

import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

export type SerializedEmbedNode = Spread<
  {
    src: string;
    title?: string;
  },
  SerializedLexicalNode
>;

function optionalString(raw: unknown): string | undefined {
  return typeof raw === 'string' && raw.trim() !== '' ? raw : undefined;
}

export class EmbedNode extends DecoratorNode<never> {
  __src: string;
  __title?: string;

  static getType(): string {
    return 'embed';
  }

  static clone(node: EmbedNode): EmbedNode {
    return new EmbedNode(node.__src, node.__title, node.__key);
  }

  static importJSON(serialized: SerializedEmbedNode): EmbedNode {
    return new EmbedNode(
      typeof serialized.src === 'string' ? serialized.src : '',
      optionalString(serialized.title),
    ).updateFromJSON(serialized);
  }

  exportJSON(): SerializedEmbedNode {
    return {
      ...super.exportJSON(),
      src: this.getSrc(),
      title: this.getTitle(),
    };
  }

  constructor(src?: string, title?: string, key?: string) {
    super(key);
    this.__src = src ?? '';
    this.__title = title;
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    if (typeof document === 'undefined') {
      throw new Error('EmbedNode.createDOM 不应在服务端被调用');
    }
    const div = document.createElement('div');
    div.className = 'vislex-embed-wrap';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getSrc(): string {
    return this.getLatest().__src;
  }

  setSrc(src: string): this {
    const writable = this.getWritable();
    writable.__src = src;
    return writable;
  }

  getTitle(): string | undefined {
    return this.getLatest().__title;
  }

  setTitle(title: string | undefined): this {
    const writable = this.getWritable();
    writable.__title = title;
    return writable;
  }

  getTextContent(): string {
    // 嵌入无正文文本，以地址作为纯文本兜底；不参与翻译
    return this.getLatest().__src;
  }

  decorate(): never {
    throw new Error('EmbedNode.decorate 不应在服务端被调用');
  }
}

export function $createEmbedNode(src?: string): EmbedNode {
  return new EmbedNode(src);
}

export function $isEmbedNode(node: LexicalNode | null | undefined): node is EmbedNode {
  return node instanceof EmbedNode;
}

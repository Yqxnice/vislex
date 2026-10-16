import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';
import type { JSX } from 'react';
import { EmbedComponent } from './EmbedComponent';
import { blockWrap } from '../../ui/classes';

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

/**
 * 嵌入块节点（DecoratorNode，块级）。
 * 数据只有 src / title，渲染交由 EmbedComponent 输出沙箱化 <iframe>。
 *
 * 服务端 core 有同构副本，type 名（embed）与 JSON 格式必须一致。
 */
export class EmbedNode extends DecoratorNode<JSX.Element> {
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
    const div = document.createElement('div');
    div.className = blockWrap;
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

  decorate(_editor: LexicalEditor): JSX.Element {
    return (
      <EmbedComponent
        nodeKey={this.getKey()}
        src={this.getSrc()}
        title={this.getTitle()}
      />
    );
  }
}

export function $createEmbedNode(src?: string): EmbedNode {
  return new EmbedNode(src);
}

export function $isEmbedNode(node: LexicalNode | null | undefined): node is EmbedNode {
  return node instanceof EmbedNode;
}

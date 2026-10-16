/**
 * VideoNode 的 headless 同构副本。
 *
 * 与 packages/vislex/src/plugins/video/VideoNode.tsx 保持同步：
 * type 名（video）与 JSON 序列化格式（{src, poster?, title?}）必须一致。
 */

import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

export type SerializedVideoNode = Spread<
  {
    src: string;
    poster?: string;
    title?: string;
  },
  SerializedLexicalNode
>;

function optionalString(raw: unknown): string | undefined {
  return typeof raw === 'string' && raw.trim() !== '' ? raw : undefined;
}

export class VideoNode extends DecoratorNode<never> {
  __src: string;
  __poster?: string;
  __title?: string;

  static getType(): string {
    return 'video';
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__src, node.__poster, node.__title, node.__key);
  }

  static importJSON(serialized: SerializedVideoNode): VideoNode {
    return new VideoNode(
      typeof serialized.src === 'string' ? serialized.src : '',
      optionalString(serialized.poster),
      optionalString(serialized.title),
    ).updateFromJSON(serialized);
  }

  exportJSON(): SerializedVideoNode {
    return {
      ...super.exportJSON(),
      src: this.getSrc(),
      poster: this.getPoster(),
      title: this.getTitle(),
    };
  }

  constructor(src?: string, poster?: string, title?: string, key?: string) {
    super(key);
    this.__src = src ?? '';
    this.__poster = poster;
    this.__title = title;
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    if (typeof document === 'undefined') {
      throw new Error('VideoNode.createDOM 不应在服务端被调用');
    }
    const div = document.createElement('div');
    div.className = 'vislex-video-wrap';
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

  getPoster(): string | undefined {
    return this.getLatest().__poster;
  }

  setPoster(poster: string | undefined): this {
    const writable = this.getWritable();
    writable.__poster = poster;
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
    // 视频无正文文本，以地址作为纯文本兜底；不参与翻译
    return this.getLatest().__src;
  }

  decorate(): never {
    throw new Error('VideoNode.decorate 不应在服务端被调用');
  }
}

export function $createVideoNode(src?: string): VideoNode {
  return new VideoNode(src);
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode;
}

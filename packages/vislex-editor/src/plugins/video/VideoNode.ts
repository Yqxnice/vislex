import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';
import type { JSX } from 'react';
import { createRendererDecoration } from '../../renderer/RendererWrapper.js';
import { blockWrap } from '../../ui/classes.css';

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

/**
 * 视频块节点（DecoratorNode，块级，static 版）。
 * 数据只有 src / poster / title；静态渲染走 RendererConfig 的 Video 槽位
 * （<video controls> 输出由 @vislex/renderer-video 在 compose 时注入）。
 *
 * 服务端 core 有同构副本，type 名（video）与 JSON 格式必须一致。
 */
export class VideoNode extends DecoratorNode<JSX.Element> {
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

  decorate(): JSX.Element {
    return createRendererDecoration('Video', undefined, {
      src: this.getSrc(),
      poster: this.getPoster(),
      title: this.getTitle(),
    });
  }
}

export function $createVideoNode(src?: string): VideoNode {
  return new VideoNode(src);
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode;
}

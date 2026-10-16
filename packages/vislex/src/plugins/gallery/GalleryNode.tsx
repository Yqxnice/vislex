import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';
import type { JSX } from 'react';
import { blockWrap } from '../../ui/classes';
import { GalleryComponent } from './GalleryComponent';

/** 图库布局：等宽网格 / 变高瀑布流 / 横向轮播 */
export type GalleryLayout = 'grid' | 'masonry' | 'carousel';

export const GALLERY_LAYOUTS: GalleryLayout[] = ['grid', 'masonry', 'carousel'];

/** 单张图片；不存宽高，瀑布流靠 CSS 列 + 图片自身宽高比排版 */
export interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
}

export type SerializedGalleryNode = Spread<
  {
    layout: GalleryLayout;
    images: GalleryImage[];
  },
  SerializedLexicalNode
>;

/** 把任意值规整成图片数组：丢弃空 src 的行 */
export function normalizeGalleryImages(raw: unknown): GalleryImage[] {
  if (!Array.isArray(raw)) return [];
  const images: GalleryImage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const src = typeof record.src === 'string' ? record.src.trim() : '';
    if (!src) continue;
    const alt = typeof record.alt === 'string' ? record.alt.trim() : '';
    const caption = typeof record.caption === 'string' ? record.caption.trim() : '';
    images.push({
      src,
      alt: alt || undefined,
      caption: caption || undefined,
    });
  }
  return images;
}

export function normalizeGalleryLayout(raw: unknown): GalleryLayout {
  const key = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  return (GALLERY_LAYOUTS as string[]).includes(key) ? (key as GalleryLayout) : 'grid';
}

/**
 * 图库节点（DecoratorNode，块级）。
 *
 * 设计要点：
 * - 数据只有 layout 与 images 两个字段，Markdown 往返见 transformer.ts；
 * - 渲染（三种布局 + 灯箱）与图片上传都在客户端完成，
 *   服务端 headless 场景使用 apps/core 内的同构副本（type 名与序列化格式保持一致）。
 */
export class GalleryNode extends DecoratorNode<JSX.Element> {
  __layout: GalleryLayout;
  __images: GalleryImage[];

  static getType(): string {
    return 'gallery';
  }

  static clone(node: GalleryNode): GalleryNode {
    return new GalleryNode(node.__layout, node.__images, node.__key);
  }

  static importJSON(serialized: SerializedGalleryNode): GalleryNode {
    return new GalleryNode(
      normalizeGalleryLayout(serialized.layout),
      normalizeGalleryImages(serialized.images),
    ).updateFromJSON(serialized);
  }

  exportJSON(): SerializedGalleryNode {
    return {
      ...super.exportJSON(),
      layout: this.getLayout(),
      images: this.getImages(),
    };
  }

  constructor(layout?: GalleryLayout, images?: GalleryImage[], key?: string) {
    super(key);
    this.__layout = layout ?? 'grid';
    this.__images = images ?? [];
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('div');
    dom.className = blockWrap;
    return dom;
  }

  updateDOM(): boolean {
    // decorate 由 React 全量接管，数据变化通过重新渲染生效
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getLayout(): GalleryLayout {
    return this.getLatest().__layout;
  }

  setLayout(layout: GalleryLayout): this {
    const writable = this.getWritable();
    writable.__layout = layout;
    return writable;
  }

  getImages(): GalleryImage[] {
    return this.getLatest().__images;
  }

  setImages(images: GalleryImage[]): this {
    const writable = this.getWritable();
    writable.__images = images.map((image) => ({ ...image }));
    return writable;
  }

  getTextContent(): string {
    // 图库无正文文本，仅以图片地址作为纯文本兜底；不参与翻译（非 paragraph 块）
    return this.getLatest().__images.map((image) => image.src).join('\n');
  }

  decorate(_editor: LexicalEditor): JSX.Element {
    return (
      <GalleryComponent
        nodeKey={this.getKey()}
        layout={this.getLayout()}
        images={this.getImages()}
      />
    );
  }
}

export function $createGalleryNode(layout?: GalleryLayout, images?: GalleryImage[]): GalleryNode {
  return new GalleryNode(layout, images);
}

export function $isGalleryNode(node: LexicalNode | null | undefined): node is GalleryNode {
  return node instanceof GalleryNode;
}

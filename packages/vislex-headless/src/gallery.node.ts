/**
 * GalleryNode 的 headless 同构副本。
 *
 * 与 packages/vislex/src/plugins/gallery/GalleryNode.tsx 保持同步：
 * type 名（gallery）与 JSON 序列化格式（{layout, images}）必须一致。
 */

import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

/** 图库布局：等宽网格 / 变高瀑布流 / 横向轮播 */
export type GalleryLayout = 'grid' | 'masonry' | 'carousel';

export const GALLERY_LAYOUTS: GalleryLayout[] = ['grid', 'masonry', 'carousel'];

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

export class GalleryNode extends DecoratorNode<never> {
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
    if (typeof document === 'undefined') {
      throw new Error('GalleryNode.createDOM 不应在服务端被调用');
    }
    const div = document.createElement('div');
    div.className = 'vislex-gallery-wrap';
    return div;
  }

  updateDOM(): boolean {
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

  decorate(): never {
    throw new Error('GalleryNode.decorate 不应在服务端被调用');
  }
}

export function $createGalleryNode(layout?: GalleryLayout, images?: GalleryImage[]): GalleryNode {
  return new GalleryNode(layout, images);
}

export function $isGalleryNode(node: LexicalNode | null | undefined): node is GalleryNode {
  return node instanceof GalleryNode;
}

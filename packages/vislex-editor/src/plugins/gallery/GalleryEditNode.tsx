import type { LexicalNode } from 'lexical';
import type { JSX } from 'react';
import { GalleryComponent } from './GalleryComponent.js';
import {
  GalleryNode,
  normalizeGalleryImages,
  normalizeGalleryLayout,
  type GalleryImage,
  type GalleryLayout,
  type SerializedGalleryNode,
} from './GalleryNode.js';

/** 编辑态图库节点：与 GalleryNode 共享 type 字符串，decorate 交给组件跟踪编辑器可编辑态 */
export class GalleryEditNode extends GalleryNode {
  // Lexical 0.52 要求具体节点类自带 own static getType（否则 DEV 告警）
  static getType(): string {
    return 'gallery';
  }

  static clone(node: GalleryEditNode): GalleryEditNode {
    return new GalleryEditNode(node.__layout, node.__images, node.__key);
  }

  static importJSON(serialized: SerializedGalleryNode): GalleryEditNode {
    return $createGalleryEditNode(
      normalizeGalleryLayout(serialized.layout),
      normalizeGalleryImages(serialized.images),
    ).updateFromJSON(serialized);
  }

  decorate(): JSX.Element {
    return (
      <GalleryComponent
        nodeKey={this.getKey()}
        layout={this.getLayout()}
        images={this.getImages()}
      />
    );
  }
}

export function $createGalleryEditNode(layout?: GalleryLayout, images?: GalleryImage[]): GalleryEditNode {
  return new GalleryEditNode(layout, images);
}

export function $isGalleryEditNode(node: LexicalNode | null | undefined): node is GalleryEditNode {
  return node instanceof GalleryEditNode;
}

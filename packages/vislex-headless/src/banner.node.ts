/**
 * BannerNode 的 headless 同构副本。
 *
 * 与 packages/vislex/src/plugins/banner/BannerNode.tsx 保持同步：
 * type 名（banner）与 JSON 序列化格式（{variant: BannerType}）必须一致。
 *
 * Banner 是 ElementNode，内部可容纳段落等可编辑子节点。
 *
 * 注意：字段名不能用 __type / type —— 那是 Lexical 内部存放「节点类型名」的位置，
 * 覆盖后节点类型会变成 info，$applyTransforms 查注册节点时报 Type info not found。
 */

import {
  ElementNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedElementNode,
  type Spread,
} from 'lexical';

export type BannerType = 'info' | 'success' | 'warning' | 'error';

export const BANNER_TYPES: BannerType[] = ['info', 'success', 'warning', 'error'];

export type SerializedBannerNode = Spread<
  { variant: BannerType },
  SerializedElementNode
>;

export class BannerNode extends ElementNode {
  __bannerType: BannerType;

  static getType(): string {
    return 'banner';
  }

  static clone(node: BannerNode): BannerNode {
    return new BannerNode(node.__bannerType, node.__key);
  }

  static importJSON(serialized: SerializedBannerNode): BannerNode {
    return $createBannerNode(serialized.variant ?? 'info').updateFromJSON(serialized);
  }

  exportJSON(): SerializedBannerNode {
    return {
      ...super.exportJSON(),
      variant: this.getBannerType(),
    };
  }

  constructor(type?: BannerType, key?: string) {
    super(key);
    this.__bannerType = type ?? 'info';
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    if (typeof document === 'undefined') {
      throw new Error('BannerNode.createDOM 不应在服务端被调用');
    }
    const div = document.createElement('div');
    div.className = `vislex-banner vislex-banner-${this.__bannerType}`;
    return div;
  }

  updateDOM(prevNode: BannerNode, dom: HTMLElement): boolean {
    if (prevNode.__bannerType !== this.__bannerType) {
      dom.className = `vislex-banner vislex-banner-${this.__bannerType}`;
      return true;
    }
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getBannerType(): BannerType {
    return this.getLatest().__bannerType;
  }

  setBannerType(type: BannerType): this {
    const writable = this.getWritable();
    writable.__bannerType = type;
    return writable;
  }
}

export function $createBannerNode(type?: BannerType): BannerNode {
  return new BannerNode(type);
}

export function $isBannerNode(node: LexicalNode | null | undefined): node is BannerNode {
  return node instanceof BannerNode;
}

import { ElementNode, type EditorConfig, type LexicalEditor, type LexicalNode, type SerializedElementNode, type Spread } from 'lexical';
import { bannerClasses } from './banner.css';

export type BannerType = 'info' | 'success' | 'warning' | 'error';

export const BANNER_TYPES: BannerType[] = ['info', 'success', 'warning', 'error'];

export type SerializedBannerNode = Spread<
  { variant: BannerType },
  SerializedElementNode
>;

/**
 * Banner 提示块节点（ElementNode，block）。
 *
 * 设计要点：
 * - 继承 ElementNode 而非 DecoratorNode，因此内部可放段落、列表等可编辑富文本；
 * - 只存一个 variant 字段（info/success/warning/error），决定配色；
 * - 类型切换由 BannerToolbar（插件 render 的浮动工具条）驱动 setBannerType；
 * - createDOM 输出带类型 class 的容器，updateDOM 在 variant 变化时切换 class；
 * - 服务端 core 有同构副本，type 名（banner）与 JSON 格式（{variant}）必须一致。
 *
 * 注意：字段名不能用 __type / type —— 那是 Lexical 内部存放「节点类型名」的位置，
 * 覆盖后节点类型会变成 info，$applyTransforms 查注册节点时报 Type info not found。
 */
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
    const div = document.createElement('div');
    div.className = bannerClasses[this.__bannerType];
    return div;
  }

  updateDOM(prevNode: BannerNode, dom: HTMLElement): boolean {
    if (prevNode.__bannerType !== this.__bannerType) {
      dom.className = bannerClasses[this.__bannerType];
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

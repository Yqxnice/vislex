import { ElementNode, type EditorConfig, type LexicalEditor, type LexicalNode, type SerializedElementNode, type Spread } from 'lexical';

export type BannerType = 'info' | 'success' | 'warning' | 'error';

export const BANNER_TYPES: BannerType[] = ['info', 'success', 'warning', 'error'];

/**
 * 各类型配色（Tailwind v4 静态类，扫描器需要字面量）：
 * border-l 颜色 + 0.08 淡底 + ::before 圆形图标底色与字形。
 * 保留 vislex-banner 钩子类（残余 CSS 保留 .vislex-banner > p 的 margin 覆盖）。
 */
const BANNER_TYPE_CLASSES: Record<BannerType, string> = {
  info: "border-l-blue-500 bg-blue-500/[0.08] before:bg-blue-500 before:content-['i']",
  success: "border-l-green-600 bg-green-600/[0.08] before:bg-green-600 before:content-['✓']",
  warning: "border-l-amber-600 bg-amber-600/[0.08] before:bg-amber-600 before:content-['!']",
  error: "border-l-red-600 bg-red-600/[0.08] before:bg-red-600 before:content-['✕']",
};

const BANNER_BASE_CLASSES =
  'vislex-banner relative my-3 rounded-md border-l-4 py-3.5 pr-4 pl-11 text-vl-text before:absolute before:top-3.5 before:left-3.5 before:flex before:size-5 before:items-center before:justify-center before:rounded-full before:text-xs before:font-bold before:text-white dark:bg-white/[0.04]';

function bannerClassName(type: BannerType): string {
  return `${BANNER_BASE_CLASSES} ${BANNER_TYPE_CLASSES[type]}`;
}

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
    div.className = bannerClassName(this.__bannerType);
    return div;
  }

  updateDOM(prevNode: BannerNode, dom: HTMLElement): boolean {
    if (prevNode.__bannerType !== this.__bannerType) {
      dom.className = bannerClassName(this.__bannerType);
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

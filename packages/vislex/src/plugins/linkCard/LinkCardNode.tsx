import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';
import type { JSX } from 'react';
import { LinkCardComponent } from './LinkCardComponent';

/** 卡片布局：紧凑（单行信息）/ 宽版（多区块描述） */
export type LinkCardShape = 'compact' | 'wide';

export const LINK_CARD_SHAPES: LinkCardShape[] = ['compact', 'wide'];

/**
 * 链接卡片的匹配数据结构。
 * 所有渲染层可能访问的字段都显式声明为可选，剩余 matcher 自定义字段通过索引签名透传。
 * 内置 matcher 的数据结构见 matchers/*.ts。
 */
export interface LinkCardData {
  /** 决定卡片宽高型 */
  shape: LinkCardShape;
  /** 可选的标题，fallback 静态卡片也会用 */
  title?: string;
  /** 可选的封面图 URL */
  image?: string;
  /** 可选的描述文本 */
  description?: string;
  /** 可选的主机名（错误状态展示） */
  host?: string;
  /** 卡片子类型标识（如 gh-repo / gh-pr / leetcode / netease-song / qq-song） */
  kind?: string;

  // --- GitHub 专用 ---
  /** 仓库路径 owner/repo */
  repository?: string;
  /** PR / Issue / Discussion 编号 */
  number?: number;
  /** PR diff 统计 */
  diffStats?: { additions: number; deletions: number; changedFiles?: number };
  /** Commit SHA */
  sha?: string;
  /** 仓库 star 数 */
  stars?: number;
  /** PR / Issue 状态 */
  state?: string;
  /** Discussion 分类 */
  category?: string;

  // --- LeetCode 专用 ---
  difficulty?: string;
  tags?: string[];
  acceptanceRate?: number;

  // --- 音乐专用 ---
  artist?: string;
  album?: string;

  /** 任意 matcher 自定义字段（扩展点） */
  [key: string]: unknown;
}

export type SerializedLinkCardNode = Spread<
  {
    url: string;
    shape: LinkCardShape;
    matcherName?: string;
    data?: LinkCardData;
    error?: string;
  },
  SerializedLexicalNode
>;

export function normalizeLinkCardShape(raw: unknown): LinkCardShape {
  const key = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  return (LINK_CARD_SHAPES as string[]).includes(key) ? (key as LinkCardShape) : 'compact';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeLinkCardData(raw: unknown): LinkCardData | undefined {
  if (!isRecord(raw)) return undefined;
  const shape = normalizeLinkCardShape(raw.shape);
  const data: LinkCardData = { shape };
  if (typeof raw.title === 'string') data.title = raw.title;
  if (typeof raw.image === 'string') data.image = raw.image;
  if (typeof raw.description === 'string') data.description = raw.description;
  if (typeof raw.host === 'string') data.host = raw.host;
  // 透传其余自定义字段
  for (const [k, v] of Object.entries(raw)) {
    if (!['title', 'image', 'description', 'host', 'shape'].includes(k)) {
      data[k] = v;
    }
  }
  return data;
}

/**
 * Link Card 节点（DecoratorNode，块级）。
 *
 * 设计要点：
 * - 存储 url 为原始来源；matcherName 记录是哪个 matcher 解析的；
 * - data 字段缓存匹配结果，持久化到 JSON 后 SSR / 重渲染不会再 fetch；
 * - error 记录 fetch 失败原因（如 404），用于降级展示；
 * - shape 可独立于 data 手动指定，覆盖 matcher 默认布局（极少见，先留入口）。
 *
 * 服务端 core 有同构副本，type 名（linkcard）与 JSON 格式必须一致。
 */
export class LinkCardNode extends DecoratorNode<JSX.Element> {
  __url: string;
  __shape: LinkCardShape;
  __matcherName?: string;
  __data?: LinkCardData;
  __error?: string;

  static getType(): string {
    return 'linkcard';
  }

  static clone(node: LinkCardNode): LinkCardNode {
    return new LinkCardNode(node.__url, node.__shape, node.__matcherName, node.__data, node.__error, node.__key);
  }

  static importJSON(serialized: SerializedLinkCardNode): LinkCardNode {
    return new LinkCardNode(
      serialized.url ?? '',
      normalizeLinkCardShape(serialized.shape),
      serialized.matcherName,
      normalizeLinkCardData(serialized.data),
      typeof serialized.error === 'string' ? serialized.error : undefined,
    ).updateFromJSON(serialized);
  }

  exportJSON(): SerializedLinkCardNode {
    return {
      ...super.exportJSON(),
      url: this.getUrl(),
      shape: this.getShape(),
      matcherName: this.getMatcherName(),
      data: this.getData(),
      error: this.getError(),
    };
  }

  constructor(
    url: string,
    shape?: LinkCardShape,
    matcherName?: string,
    data?: LinkCardData,
    error?: string,
    key?: string,
  ) {
    super(key);
    this.__url = url;
    this.__shape = shape ?? 'compact';
    this.__matcherName = matcherName;
    this.__data = data;
    this.__error = error;
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('div');
    dom.className = 'block my-2.5';
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getUrl(): string {
    return this.getLatest().__url;
  }

  setUrl(url: string): this {
    const writable = this.getWritable();
    writable.__url = url;
    return writable;
  }

  getShape(): LinkCardShape {
    return this.getLatest().__shape;
  }

  setShape(shape: LinkCardShape): this {
    const writable = this.getWritable();
    writable.__shape = shape;
    return writable;
  }

  getMatcherName(): string | undefined {
    return this.getLatest().__matcherName;
  }

  setMatcherName(name: string | undefined): this {
    const writable = this.getWritable();
    writable.__matcherName = name;
    return writable;
  }

  getData(): LinkCardData | undefined {
    return this.getLatest().__data;
  }

  setData(data: LinkCardData | undefined): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  getError(): string | undefined {
    return this.getLatest().__error;
  }

  setError(error: string | undefined): this {
    const writable = this.getWritable();
    writable.__error = error;
    return writable;
  }

  getTextContent(): string {
    // 链接卡片无正文文本，以 URL 作为纯文本兜底；不参与翻译
    return this.getLatest().__url;
  }

  decorate(_editor: LexicalEditor): JSX.Element {
    return (
      <LinkCardComponent
        nodeKey={this.getKey()}
        url={this.getUrl()}
        shape={this.getShape()}
        matcherName={this.getMatcherName()}
        data={this.getData()}
        error={this.getError()}
      />
    );
  }
}

export function $createLinkCardNode(url: string, shape?: LinkCardShape): LinkCardNode {
  return new LinkCardNode(url, shape);
}

export function $isLinkCardNode(node: LexicalNode | null | undefined): node is LinkCardNode {
  return node instanceof LinkCardNode;
}

/**
 * LinkCardNode 的 headless 同构副本。
 *
 * 与 packages/vislex/src/plugins/linkCard/LinkCardNode.tsx 保持同步：
 * type 名（linkcard）与 JSON 序列化格式（{url, shape, matcherName, data, error}）必须一致。
 */

import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

/** 卡片布局：紧凑（单行信息）/ 宽版（多区块描述） */
export type LinkCardShape = 'compact' | 'wide';

export const LINK_CARD_SHAPES: LinkCardShape[] = ['compact', 'wide'];

/** 链接卡片的匹配数据结构 —— 与前端保持一致 */
export interface LinkCardData {
  shape: LinkCardShape;
  title?: string;
  image?: string;
  description?: string;
  host?: string;
  kind?: string;

  // --- GitHub 专用 ---
  repository?: string;
  number?: number;
  diffStats?: { additions: number; deletions: number; changedFiles?: number };
  sha?: string;
  stars?: number;
  state?: string;
  category?: string;

  // --- LeetCode 专用 ---
  difficulty?: string;
  tags?: string[];
  acceptanceRate?: number;

  // --- 音乐专用 ---
  artist?: string;
  album?: string;

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
  for (const [k, v] of Object.entries(raw)) {
    if (!['title', 'image', 'description', 'host', 'shape'].includes(k)) {
      data[k] = v;
    }
  }
  return data;
}

export class LinkCardNode extends DecoratorNode<never> {
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
    if (typeof document === 'undefined') {
      throw new Error('LinkCardNode.createDOM 不应在服务端被调用');
    }
    const dom = document.createElement('div');
    dom.className = 'vislex-linkcard-wrap';
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
    return this.getLatest().__url;
  }

  decorate(): never {
    throw new Error('LinkCardNode.decorate 不应在服务端被调用');
  }
}

export function $createLinkCardNode(url: string, shape?: LinkCardShape): LinkCardNode {
  return new LinkCardNode(url, shape);
}

export function $isLinkCardNode(node: LexicalNode | null | undefined): node is LinkCardNode {
  return node instanceof LinkCardNode;
}

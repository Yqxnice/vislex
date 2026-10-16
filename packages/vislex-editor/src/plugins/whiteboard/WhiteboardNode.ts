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

/** 白板数据的三种存储策略 */
export type WhiteboardMode =
  /** 内联：完整快照 JSON 直接存在节点里，自包含 */
  | 'inline'
  /** 远程：快照上传到远端 blob，节点只留 URL 引用 */
  | 'remote'
  /** Delta：节点存「基础快照引用 + JSON 差值补丁」，按需重建完整场景 */
  | 'delta';

export type SerializedWhiteboardNode = Spread<
  {
    mode: WhiteboardMode;
    /** 内联模式：完整场景 JSON 文本；其余模式为空 */
    scene: string;
    /** 远程 / Delta 模式：快照 URL（Delta 下为基础快照引用） */
    src: string;
    /** Delta 模式：RFC6902 差值补丁（JSON 数组文本） */
    patch: string;
  },
  SerializedLexicalNode
>;

/**
 * Excalidraw 嵌入式白板节点（DecoratorNode，块级，static 版）。
 *
 * 设计要点：
 * - 数据字段就是三种存储策略的载体：scene（内联）/ src（远程）/ src + patch（Delta）；
 * - Markdown 往返见 transformer.ts，围栏体统一是节点数据的 JSON 文本；
 * - 静态渲染走 RendererConfig 的 Whiteboard 槽位（只读快照渲染由
 *   @vislex/renderer-whiteboard 在 compose 时注入），节点本体不引用 Excalidraw；
 * - 服务端 headless 场景使用 apps/core 内的同构副本（type 名与序列化格式保持一致）。
 */
export class WhiteboardNode extends DecoratorNode<JSX.Element> {
  __mode: WhiteboardMode;
  __scene: string;
  __src: string;
  __patch: string;

  static getType(): string {
    return 'whiteboard';
  }

  static clone(node: WhiteboardNode): WhiteboardNode {
    return new WhiteboardNode(
      node.__mode,
      node.__scene,
      node.__src,
      node.__patch,
      node.__key,
    );
  }

  static importJSON(serialized: SerializedWhiteboardNode): WhiteboardNode {
    return new WhiteboardNode(
      serialized.mode ?? 'inline',
      serialized.scene ?? '',
      serialized.src ?? '',
      serialized.patch ?? '',
    ).updateFromJSON(serialized);
  }

  exportJSON(): SerializedWhiteboardNode {
    return {
      ...super.exportJSON(),
      mode: this.getMode(),
      scene: this.getScene(),
      src: this.getSrc(),
      patch: this.getPatch(),
    };
  }

  constructor(
    mode?: WhiteboardMode,
    scene?: string,
    src?: string,
    patch?: string,
    key?: string,
  ) {
    super(key);
    this.__mode = mode ?? 'inline';
    this.__scene = scene ?? '';
    this.__src = src ?? '';
    this.__patch = patch ?? '';
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

  getMode(): WhiteboardMode {
    return this.getLatest().__mode;
  }

  setMode(mode: WhiteboardMode): this {
    const writable = this.getWritable();
    writable.__mode = mode;
    return writable;
  }

  getScene(): string {
    return this.getLatest().__scene;
  }

  setScene(scene: string): this {
    const writable = this.getWritable();
    writable.__scene = scene;
    return writable;
  }

  getSrc(): string {
    return this.getLatest().__src;
  }

  setSrc(src: string): this {
    const writable = this.getWritable();
    writable.__src = src;
    return writable;
  }

  getPatch(): string {
    return this.getLatest().__patch;
  }

  setPatch(patch: string): this {
    const writable = this.getWritable();
    writable.__patch = patch;
    return writable;
  }

  getTextContent(): string {
    // 白板没有可提取的纯文本，翻译与纯文本往返都跳过它
    return '';
  }

  decorate(): JSX.Element {
    return createRendererDecoration('Whiteboard', undefined, {
      mode: this.getMode(),
      scene: this.getScene(),
      src: this.getSrc(),
      patch: this.getPatch(),
    });
  }
}

export function $createWhiteboardNode(
  mode?: WhiteboardMode,
  scene?: string,
  src?: string,
  patch?: string,
): WhiteboardNode {
  return new WhiteboardNode(mode, scene, src, patch);
}

export function $isWhiteboardNode(
  node: LexicalNode | null | undefined,
): node is WhiteboardNode {
  return node instanceof WhiteboardNode;
}

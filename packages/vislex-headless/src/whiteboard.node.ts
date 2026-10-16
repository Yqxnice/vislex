/**
 * WhiteboardNode 的 headless 同构副本。
 *
 * 与 packages/vislex/src/plugins/whiteboard/WhiteboardNode.tsx 保持同步：
 * type 名（whiteboard）与 JSON 序列化格式（{mode, scene, src, patch}）必须一致。
 */

import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

/** 白板数据的三种存储策略：内联 / 远程 / Delta */
export type WhiteboardMode = 'inline' | 'remote' | 'delta';

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

export class WhiteboardNode extends DecoratorNode<never> {
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
    if (typeof document === 'undefined') {
      throw new Error('WhiteboardNode.createDOM 不应在服务端被调用');
    }
    const div = document.createElement('div');
    div.className = 'vislex-whiteboard-wrap';
    return div;
  }

  updateDOM(): boolean {
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

  decorate(): never {
    throw new Error('WhiteboardNode.decorate 不应在服务端被调用');
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

/**
 * RubyNode 的 headless 同构副本。
 *
 * 与 packages/vislex/src/plugins/ruby/RubyNode.tsx 保持同步：
 * type 名（ruby）与 JSON 序列化格式（{base, rt}）必须一致。
 */

import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

export type SerializedRubyNode = Spread<
  {
    base: string;
    rt: string;
  },
  SerializedLexicalNode
>;

export class RubyNode extends DecoratorNode<never> {
  __base: string;
  __rt: string;

  static getType(): string {
    return 'ruby';
  }

  static clone(node: RubyNode): RubyNode {
    return new RubyNode(node.__base, node.__rt, node.__key);
  }

  static importJSON(serialized: SerializedRubyNode): RubyNode {
    return $createRubyNode(
      typeof serialized.base === 'string' ? serialized.base : '',
      typeof serialized.rt === 'string' ? serialized.rt : '',
    ).updateFromJSON(serialized);
  }

  exportJSON(): SerializedRubyNode {
    return {
      ...super.exportJSON(),
      base: this.getBase(),
      rt: this.getRt(),
    };
  }

  constructor(base?: string, rt?: string, key?: string) {
    super(key);
    this.__base = base ?? '';
    this.__rt = rt ?? '';
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    if (typeof document === 'undefined') {
      throw new Error('RubyNode.createDOM 不应在服务端被调用');
    }
    const span = document.createElement('span');
    span.className = 'vislex-ruby-wrap';
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return true;
  }

  getBase(): string {
    return this.getLatest().__base;
  }

  setBase(base: string): this {
    const writable = this.getWritable();
    writable.__base = base;
    return writable;
  }

  getRt(): string {
    return this.getLatest().__rt;
  }

  setRt(rt: string): this {
    const writable = this.getWritable();
    writable.__rt = rt;
    return writable;
  }

  getTextContent(): string {
    return this.getLatest().__base;
  }

  decorate(): never {
    throw new Error('RubyNode.decorate 不应在服务端被调用');
  }
}

export function $createRubyNode(base?: string, rt?: string): RubyNode {
  return new RubyNode(base, rt);
}

export function $isRubyNode(node: LexicalNode | null | undefined): node is RubyNode {
  return node instanceof RubyNode;
}

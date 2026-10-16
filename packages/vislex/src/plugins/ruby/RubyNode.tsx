import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';
import type { JSX } from 'react';
import { RubyComponent } from './RubyComponent';

export type SerializedRubyNode = Spread<
  {
    base: string;
    rt: string;
  },
  SerializedLexicalNode
>;

/**
 * Ruby 注音节点（DecoratorNode，行内）。
 * 数据只有 base（注音对象文本）与 rt（注音内容），渲染交由 RubyComponent 输出 <ruby>。
 *
 * 服务端 core 有同构副本，type 名（ruby）与 JSON 格式必须一致。
 */
export class RubyNode extends DecoratorNode<JSX.Element> {
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
    const span = document.createElement('span');
    span.className = 'mx-px inline-block align-baseline';
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

  decorate(editor: LexicalEditor): JSX.Element {
    return (
      <RubyComponent
        nodeKey={this.getKey()}
        base={this.getBase()}
        rt={this.getRt()}
        editable={editor.isEditable()}
      />
    );
  }
}

export function $createRubyNode(base?: string, rt?: string): RubyNode {
  return new RubyNode(base, rt);
}

export function $isRubyNode(node: LexicalNode | null | undefined): node is RubyNode {
  return node instanceof RubyNode;
}

/**
 * MermaidNode 的 headless 同构副本。
 *
 * 与 packages/vislex/src/plugins/mermaid/MermaidNode.tsx 保持同步：
 * type 名（mermaid）与 JSON 序列化格式（{code: string}）必须一致。
 */

import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

export type SerializedMermaidNode = Spread<
  { code: string },
  SerializedLexicalNode
>;

export class MermaidNode extends DecoratorNode<never> {
  __code: string;

  static getType(): string {
    return 'mermaid';
  }

  static clone(node: MermaidNode): MermaidNode {
    return new MermaidNode(node.__code, node.__key);
  }

  static importJSON(serialized: SerializedMermaidNode): MermaidNode {
    return $createMermaidNode(serialized.code ?? '').updateFromJSON(serialized);
  }

  exportJSON(): SerializedMermaidNode {
    return {
      ...super.exportJSON(),
      code: this.getCode(),
    };
  }

  constructor(code?: string, key?: string) {
    super(key);
    this.__code = code ?? '';
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    if (typeof document === 'undefined') {
      throw new Error('MermaidNode.createDOM 不应在服务端被调用');
    }
    const div = document.createElement('div');
    div.className = 'vislex-mermaid-wrap';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getCode(): string {
    return this.getLatest().__code;
  }

  setCode(code: string): this {
    const writable = this.getWritable();
    writable.__code = code;
    return writable;
  }

  getTextContent(): string {
    return this.getLatest().__code;
  }

  decorate(): never {
    throw new Error('MermaidNode.decorate 不应在服务端被调用');
  }
}

export function $createMermaidNode(code?: string): MermaidNode {
  return new MermaidNode(code);
}

export function $isMermaidNode(node: LexicalNode | null | undefined): node is MermaidNode {
  return node instanceof MermaidNode;
}

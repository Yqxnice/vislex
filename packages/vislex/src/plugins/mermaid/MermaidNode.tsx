import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';
import type { JSX } from 'react';
import { blockWrap } from '../../ui/classes';
import { MermaidComponent } from './MermaidComponent';

export type SerializedMermaidNode = Spread<
  {
    /** Mermaid 图表源码（首行为图表类型声明，如 graph TD / sequenceDiagram） */
    code: string;
  },
  SerializedLexicalNode
>;

/**
 * Mermaid 图表节点（DecoratorNode，块级）。
 *
 * 设计要点：
 * - 数据只有一个 code 字段，Markdown 往返见 transformer.ts；
 * - 静态渲染在 MermaidComponent 中完成，采用「同步优先 + 异步兜底」双引擎：
 *   beautiful-mermaid 同步出一部分类型，官方 mermaid 异步补全其余类型；
 * - 本类依赖 React（decorate），服务端 headless 场景使用
 *   apps/core 内的同构副本（type 名与序列化格式保持一致）。
 */
export class MermaidNode extends DecoratorNode<JSX.Element> {
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
    const dom = document.createElement('div');
    dom.className = blockWrap;
    return dom;
  }

  updateDOM(): boolean {
    // decorate 由 React 全量接管，code 变化通过重新渲染生效
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

  decorate(_editor: LexicalEditor): JSX.Element {
    return <MermaidComponent nodeKey={this.getKey()} code={this.getCode()} />;
  }
}

export function $createMermaidNode(code?: string): MermaidNode {
  return new MermaidNode(code);
}

export function $isMermaidNode(node: LexicalNode | null | undefined): node is MermaidNode {
  return node instanceof MermaidNode;
}

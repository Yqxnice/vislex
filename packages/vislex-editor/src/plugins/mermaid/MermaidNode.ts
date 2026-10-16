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

export type SerializedMermaidNode = Spread<
  {
    /** Mermaid 图表源码（首行为图表类型声明，如 graph TD / sequenceDiagram） */
    code: string;
  },
  SerializedLexicalNode
>;

/**
 * Mermaid 图表节点（DecoratorNode，块级，static 版）。
 *
 * 设计要点：
 * - 数据只有一个 code 字段，Markdown 往返见 transformer.ts；
 * - 静态渲染走 RendererConfig 的 Mermaid 槽位（beautiful-mermaid 同步出图 +
 *   官方 mermaid 异步兜底由 @vislex/renderer-mermaid 在 compose 时注入），
 *   节点本体不引用重依赖；
 * - 本类不依赖编辑器运行时，服务端 headless 场景使用
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

  decorate(): JSX.Element {
    return createRendererDecoration('Mermaid', undefined, { code: this.getCode() });
  }
}

export function $createMermaidNode(code?: string): MermaidNode {
  return new MermaidNode(code);
}

export function $isMermaidNode(node: LexicalNode | null | undefined): node is MermaidNode {
  return node instanceof MermaidNode;
}

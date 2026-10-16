import { DecoratorNode, type EditorConfig, type LexicalEditor, type LexicalNode, type SerializedLexicalNode, type Spread } from 'lexical';
import type { JSX } from 'react';
import { createRendererDecoration } from '../../renderer/RendererWrapper.js';
import { blockWrap } from '../../ui/classes.css';

/** 代码块中的单个文件（对应模态窗口中的一个标签页） */
export interface CodeFile {
  /** 文件名（可选），用于推导语言与标签页标题，如 index.ts */
  name?: string;
  /** shiki 语言 id，如 typescript / python；缺省时由语言检测补全 */
  language?: string;
  /** 文件内容 */
  code: string;
}

export type SerializedCodeBlockNode = Spread<
  {
    files: CodeFile[];
  },
  SerializedLexicalNode
>;

/**
 * 多文件高亮代码块节点（static 版）。
 *
 * 设计要点：
 * - 静态渲染走 RendererConfig 的 CodeBlock 槽位（shiki 双主题高亮由
 *   @vislex/renderer-codeblock 在 compose 时注入），节点本体不引用重依赖；
 * - 数据只有 files 数组，Markdown 往返见 transformer.ts；
 * - 本类不依赖编辑器运行时，服务端 headless 场景使用
 *   apps/core 内的同构副本（type 名与序列化格式保持一致）。
 */
export class CodeBlockNode extends DecoratorNode<JSX.Element> {
  __files: CodeFile[];

  static getType(): string {
    return 'code-block';
  }

  static clone(node: CodeBlockNode): CodeBlockNode {
    return new CodeBlockNode(node.__files, node.__key);
  }

  static importJSON(serialized: SerializedCodeBlockNode): CodeBlockNode {
    return $createCodeBlockNode(serialized.files ?? []).updateFromJSON(serialized);
  }

  exportJSON(): SerializedCodeBlockNode {
    return {
      ...super.exportJSON(),
      files: this.getFiles(),
    };
  }

  constructor(files?: CodeFile[], key?: string) {
    super(key);
    this.__files = files && files.length > 0 ? files : [{ code: '' }];
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('div');
    dom.className = blockWrap;
    return dom;
  }

  updateDOM(): boolean {
    // decorate 由 React 全量接管，files 变化通过重新渲染生效
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getFiles(): CodeFile[] {
    return this.getLatest().__files.map((file) => ({ ...file }));
  }

  setFiles(files: CodeFile[]): this {
    const writable = this.getWritable();
    writable.__files = files.length > 0 ? files : [{ code: '' }];
    return writable;
  }

  getTextContent(): string {
    return this.getLatest()
      .__files.map((file) => file.code)
      .join('\n');
  }

  decorate(_editor: LexicalEditor): JSX.Element {
    return createRendererDecoration('CodeBlock', undefined, { files: this.getFiles() });
  }
}

export function $createCodeBlockNode(files?: CodeFile[]): CodeBlockNode {
  return new CodeBlockNode(files);
}

export function $isCodeBlockNode(node: LexicalNode | null | undefined): node is CodeBlockNode {
  return node instanceof CodeBlockNode;
}

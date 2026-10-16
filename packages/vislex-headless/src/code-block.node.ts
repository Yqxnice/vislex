/**
 * CodeBlockNode 的 headless 同构副本。
 *
 * 与 packages/vislex/src/plugins/codeBlock/CodeBlockNode.tsx 保持同步：
 * type 名（code-block）与 JSON 序列化格式（{files: CodeFile[]}）必须一致，
 * 否则前后端 EditorState JSON 无法互通。
 *
 * 服务端只做 Markdown 往返与 JSON 读写，不需要 decorate（无 React）。
 */

import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

export interface CodeFile {
  name?: string;
  language?: string;
  code: string;
}

export type SerializedCodeBlockNode = Spread<
  { files: CodeFile[] },
  SerializedLexicalNode
>;

export class CodeBlockNode extends DecoratorNode<never> {
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
    // headless 环境不会调用；防御性实现
    if (typeof document === 'undefined') {
      throw new Error('CodeBlockNode.createDOM 不应在服务端被调用');
    }
    const dom = document.createElement('div');
    dom.className = 'vislex-codeblock-wrap';
    return dom;
  }

  updateDOM(): boolean {
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

  decorate(): never {
    throw new Error('CodeBlockNode.decorate 不应在服务端被调用');
  }
}

export function $createCodeBlockNode(files?: CodeFile[]): CodeBlockNode {
  return new CodeBlockNode(files);
}

export function $isCodeBlockNode(node: LexicalNode | null | undefined): node is CodeBlockNode {
  return node instanceof CodeBlockNode;
}

import type { LexicalNode } from 'lexical';
import type { JSX } from 'react';
import { CodeBlockComponent } from './CodeBlockComponent.js';
import { CodeBlockNode, type CodeFile, type SerializedCodeBlockNode } from './CodeBlockNode.js';

/**
 * 编辑器内使用的可编辑变体：与 CodeBlockNode 共享 type 与序列化格式，
 * decorate 不传 editable，由组件自行跟踪编辑器可编辑态。
 */
export class CodeBlockEditNode extends CodeBlockNode {
  // Lexical 0.52 要求具体节点类自带 own static getType（否则 DEV 告警）
  static getType(): string {
    return 'code-block';
  }

  static clone(node: CodeBlockEditNode): CodeBlockEditNode {
    return new CodeBlockEditNode(node.__files, node.__key);
  }

  static importJSON(serialized: SerializedCodeBlockNode): CodeBlockEditNode {
    return $createCodeBlockEditNode(serialized.files ?? []).updateFromJSON(serialized);
  }

  decorate(): JSX.Element {
    return <CodeBlockComponent nodeKey={this.getKey()} files={this.getFiles()} />;
  }
}

export function $createCodeBlockEditNode(files?: CodeFile[]): CodeBlockEditNode {
  return new CodeBlockEditNode(files);
}

export function $isCodeBlockEditNode(node: LexicalNode | null | undefined): node is CodeBlockEditNode {
  return node instanceof CodeBlockEditNode;
}

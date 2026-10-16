import type { LexicalEditor, LexicalNode } from 'lexical';
import type { JSX } from 'react';
import { LinkCardComponent } from './LinkCardComponent.js';
import { LinkCardNode, type SerializedLinkCardNode } from './LinkCardNode.js';

/**
 * 编辑态链接卡片节点：与 LinkCardNode 共享 type 与序列化格式。
 * decorate 交给 LinkCardComponent：内部负责 client-side fetch、
 * 匹配结果持久化回节点 JSON 以及错误降级展示。
 */
export class LinkCardEditNode extends LinkCardNode {
  // Lexical 0.52 要求具体节点类自带 own static getType（否则 DEV 告警）
  static getType(): string {
    return 'linkcard';
  }

  static clone(node: LinkCardEditNode): LinkCardEditNode {
    return new LinkCardEditNode(
      node.__url,
      node.__shape,
      node.__matcherName,
      node.__data,
      node.__error,
      node.__key,
    );
  }

  static importJSON(serialized: SerializedLinkCardNode): LinkCardEditNode {
    // 复用基类归一化逻辑，保证 matcherName/data/error 全字段保留
    const base = LinkCardNode.importJSON(serialized);
    return new LinkCardEditNode(
      base.getUrl(),
      base.getShape(),
      base.getMatcherName(),
      base.getData(),
      base.getError(),
    ).updateFromJSON(serialized);
  }

  decorate(_editor: LexicalEditor): JSX.Element {
    return (
      <LinkCardComponent
        nodeKey={this.getKey()}
        url={this.getUrl()}
        shape={this.getShape()}
        matcherName={this.getMatcherName()}
        data={this.getData()}
        error={this.getError()}
      />
    );
  }
}

export function $createLinkCardEditNode(url: string, shape?: LinkCardNode['__shape']): LinkCardEditNode {
  return new LinkCardEditNode(url, shape);
}

export function $isLinkCardEditNode(node: LexicalNode | null | undefined): node is LinkCardEditNode {
  return node instanceof LinkCardEditNode;
}

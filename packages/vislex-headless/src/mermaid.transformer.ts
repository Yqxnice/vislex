/**
 * Mermaid 图表 Markdown 转换器（headless / editor 共用单一实现）。
 * 通过 createMermaidTransformers(deps) 注入当前环境注册的节点类。
 *
 * 格式：```mermaid
 *       graph TD
 *         A --> B
 *       ```
 *
 * 注意：本转换器必须排在代码块转换器之前，
 * 否则 ```mermaid 会被通用围栏规则吞成普通代码块。
 */

import { $createParagraphNode, type ElementNode, type Klass, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import type { MermaidNode } from './mermaid.node.js';
import { $createMermaidNode, $isMermaidNode, MermaidNode as HeadlessMermaidNode } from './mermaid.node.js';

const MERMAID_START_REGEX = /^[ \t]*`{3,}[ \t]*(?:mermaid|mmd)[ \t]*$/;
const FENCE_END_REGEX = /^[ \t]*`{3,}[ \t]*$/;

export interface MermaidTransformersDeps {
  MermaidNode: Klass<LexicalNode>;
  createMermaidNode: (code: string) => LexicalNode;
  isMermaidNode: (node: LexicalNode | null | undefined) => boolean;
}

export function createMermaidTransformers(
  deps: MermaidTransformersDeps,
): MultilineElementTransformer[] {
  const mermaidTransformer: MultilineElementTransformer = {
    type: 'multiline-element',
    dependencies: [deps.MermaidNode],
    regExpStart: MERMAID_START_REGEX,
    regExpEnd: { optional: true, regExp: FENCE_END_REGEX },

    export: (node: LexicalNode) => {
      if (!deps.isMermaidNode(node)) return null;
      return `\`\`\`mermaid\n${(node as MermaidNode).getCode()}\n\`\`\``;
    },

    replace: (
      rootNode: ElementNode,
      children: LexicalNode[] | null,
      _startMatch: string[],
      _endMatch: string[] | null,
      linesInBetween: string[] | null,
      isImport: boolean,
    ) => {
      // 导入：linesInBetween[0] 是起始行剩余部分，空白则丢弃
      if (!children && linesInBetween) {
        const lines = [...linesInBetween];
        if (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
        while (lines.length > 0 && lines[lines.length - 1].length === 0) lines.pop();
        rootNode.append(deps.createMermaidNode(lines.join('\n')));
        return true;
      }

      // 输入快捷键：把当前段落替换成空图表，光标落到后面的新段落
      if (children) {
        if (!isImport) {
          const node = deps.createMermaidNode('');
          rootNode.replace(node);
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
        }
        return true;
      }
      return false;
    },
  };

  return [mermaidTransformer];
}

/** headless 默认绑定（零 React 节点） */
export const MERMAID_TRANSFORMERS: MultilineElementTransformer[] = createMermaidTransformers({
  MermaidNode: HeadlessMermaidNode,
  createMermaidNode: $createMermaidNode,
  isMermaidNode: $isMermaidNode,
});

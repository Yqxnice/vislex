import { $createParagraphNode, type ElementNode, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import { $createMermaidNode, $isMermaidNode, MermaidNode } from './MermaidNode';

/**
 * Mermaid 图表 Markdown 往返。
 *
 * 格式：```mermaid
 *       graph TD
 *         A --> B
 *       ```
 *
 * 注意：本转换器必须排在代码块转换器之前，
 * 否则 ```mermaid 会被通用围栏规则吞成普通代码块。
 * 服务端 core 内有一份同构副本（格式需保持一致）。
 */

const MERMAID_START_REGEX = /^[ \t]*`{3,}[ \t]*(?:mermaid|mmd)[ \t]*$/;
const FENCE_END_REGEX = /^[ \t]*`{3,}[ \t]*$/;

const mermaidTransformer: MultilineElementTransformer = {
  type: 'multiline-element',
  dependencies: [MermaidNode],
  regExpStart: MERMAID_START_REGEX,
  regExpEnd: { optional: true, regExp: FENCE_END_REGEX },

  export: (node: LexicalNode) => {
    if (!$isMermaidNode(node)) return null;
    return `\`\`\`mermaid\n${node.getCode()}\n\`\`\``;
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
      rootNode.append($createMermaidNode(lines.join('\n')));
      return true;
    }

    // 输入快捷键：把当前段落替换成空图表，光标落到后面的新段落
    if (children) {
      if (!isImport) {
        const node = $createMermaidNode('');
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

export const MERMAID_TRANSFORMERS: MultilineElementTransformer[] = [mermaidTransformer];

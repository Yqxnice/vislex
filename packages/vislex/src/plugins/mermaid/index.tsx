import { $createParagraphNode, $getRoot, $getSelection, $isParagraphNode, $isRangeSelection } from 'lexical';
import { Waypoints } from 'lucide-react';
import type { EditorPlugin } from '../../types';
import { $createMermaidNode, $isMermaidNode, MermaidNode } from './MermaidNode';
import { MERMAID_TRANSFORMERS } from './transformer';

/**
 * Mermaid 图表。
 * - 渲染：同步引擎 beautiful-mermaid 出图，官方 mermaid 异步兜底其余类型；
 * - 工具栏「点击即插入」：优先替换空段落，否则插到当前块之后，无光标则追加到文末；
 * - Markdown：```mermaid 围栏（需排在代码块转换器之前）。
 */
export const mermaidPlugin: EditorPlugin = {
  name: 'mermaid',
  nodes: [MermaidNode],
  transformers: MERMAID_TRANSFORMERS,
  toolbar: [
    {
      id: 'mermaid',
      label: <Waypoints size={16} />,
      title: '插入 Mermaid 图表',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return $isMermaidNode(selection.anchor.getNode().getTopLevelElement());
      },
      run: (editor) => {
        editor.update(() => {
          // 若当前段落已有内容，则把它当作图表源码，省去再次输入
          const selection = $getSelection();
          const anchorBlock = $isRangeSelection(selection)
            ? selection.anchor.getNode().getTopLevelElement()
            : null;

          const emptyParagraph =
            anchorBlock && $isParagraphNode(anchorBlock) && anchorBlock.getTextContent().trim() === '';
          const source = anchorBlock && !emptyParagraph ? anchorBlock.getTextContent() : '';

          const node = $createMermaidNode(source);

          if (emptyParagraph && anchorBlock) {
            anchorBlock.replace(node);
          } else if (anchorBlock && !$isMermaidNode(anchorBlock)) {
            anchorBlock.insertAfter(node);
          } else {
            $getRoot().append(node);
          }

          // 图表后补一个空段落，方便继续在下方书写
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
        });
      },
    },
  ],
};

export { $createMermaidNode, $isMermaidNode, MermaidNode };
export type { SerializedMermaidNode } from './MermaidNode';
export { MERMAID_TRANSFORMERS } from './transformer';

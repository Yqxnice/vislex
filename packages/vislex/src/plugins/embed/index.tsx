import { $createParagraphNode, $getRoot, $getSelection, $isParagraphNode, $isRangeSelection } from 'lexical';
import { Frame } from 'lucide-react';
import type { EditorPlugin } from '../../types';
import { $createEmbedNode, $isEmbedNode, EmbedNode } from './EmbedNode';
import { EMBED_TRANSFORMERS } from './transformer';

/**
 * 嵌入块（沙箱化 iframe，B 站 / YouTube 等可嵌入页面）。
 * - 工具栏「点击即插入」：优先替换空段落，否则插到当前块之后，无光标则追加到文末；
 * - 新插入的空嵌入会自动打开编辑模态框；
 * - Markdown：:::embed 单行。
 */
export const embedPlugin: EditorPlugin = {
  name: 'embed',
  nodes: [EmbedNode],
  transformers: EMBED_TRANSFORMERS,
  toolbar: [
    {
      id: 'embed',
      label: <Frame size={16} />,
      title: '插入嵌入',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return $isEmbedNode(selection.anchor.getNode().getTopLevelElement());
      },
      run: (editor) => {
        editor.update(() => {
          const selection = $getSelection();
          const anchorBlock = $isRangeSelection(selection)
            ? selection.anchor.getNode().getTopLevelElement()
            : null;

          const emptyParagraph =
            anchorBlock && $isParagraphNode(anchorBlock) && anchorBlock.getTextContent().trim() === '';

          const node = $createEmbedNode();

          if (emptyParagraph && anchorBlock) {
            anchorBlock.replace(node);
          } else if (anchorBlock && !$isEmbedNode(anchorBlock)) {
            anchorBlock.insertAfter(node);
          } else {
            $getRoot().append(node);
          }

          // 嵌入后补一个空段落，方便继续在下方书写
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
        });
      },
    },
  ],
};

export { $createEmbedNode, $isEmbedNode, EmbedNode } from './EmbedNode';
export type { SerializedEmbedNode } from './EmbedNode';
export { EMBED_TRANSFORMERS } from './transformer';

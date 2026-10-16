import { $createParagraphNode, $getRoot, $getSelection, $isParagraphNode, $isRangeSelection } from 'lexical';
import { Clapperboard } from 'lucide-react';
import type { EditorPlugin } from '../../types.js';
import { $createVideoEditNode, VideoEditNode } from './VideoEditNode.js';
import { $isVideoNode } from './VideoNode.js';
import { VIDEO_TRANSFORMERS } from './transformer.js';

/**
 * 视频块（<video controls> + 封面 / 标题）。
 * - 渲染与上传都在 VideoComponent / VideoModal 中完成，存储适配器由宿主注入；
 * - 工具栏「点击即插入」：优先替换空段落，否则插到当前块之后，无光标则追加到文末；
 * - 新插入的空视频会自动打开编辑模态框；
 * - Markdown：:::video 容器。
 */
export const videoPlugin: EditorPlugin = {
  name: 'video',
  nodes: [VideoEditNode],
  transformers: VIDEO_TRANSFORMERS,
  toolbar: [
    {
      id: 'video',
      label: <Clapperboard size={16} />,
      title: '插入视频',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return $isVideoNode(selection.anchor.getNode().getTopLevelElement());
      },
      run: (editor) => {
        editor.update(() => {
          const selection = $getSelection();
          const anchorBlock = $isRangeSelection(selection)
            ? selection.anchor.getNode().getTopLevelElement()
            : null;

          const emptyParagraph =
            anchorBlock && $isParagraphNode(anchorBlock) && anchorBlock.getTextContent().trim() === '';

          const node = $createVideoEditNode();

          if (emptyParagraph && anchorBlock) {
            anchorBlock.replace(node);
          } else if (anchorBlock && !$isVideoNode(anchorBlock)) {
            anchorBlock.insertAfter(node);
          } else {
            $getRoot().append(node);
          }

          // 视频后补一个空段落，方便继续在下方书写
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
        });
      },
    },
  ],
};

export { $createVideoNode, $isVideoNode, VideoNode } from './VideoNode.js';
export { $createVideoEditNode, $isVideoEditNode, VideoEditNode } from './VideoEditNode.js';
export type { SerializedVideoNode } from './VideoNode.js';
export { VIDEO_TRANSFORMERS } from './transformer.js';
export { VideoStorageProvider, useVideoStorage } from './storage.js';
export type { VideoStorage } from './storage.js';

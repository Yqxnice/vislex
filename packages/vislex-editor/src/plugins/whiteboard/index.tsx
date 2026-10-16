import { $createParagraphNode, $getRoot, $getSelection, $isParagraphNode, $isRangeSelection } from 'lexical';
import { Frame } from 'lucide-react';
import type { EditorPlugin } from '../../types.js';
import { $createWhiteboardEditNode, WhiteboardEditNode } from './WhiteboardEditNode.js';
import { $isWhiteboardNode } from './WhiteboardNode.js';
import { WHITEBOARD_TRANSFORMERS } from './transformer.js';

/**
 * Excalidraw 嵌入式白板。
 * - 渲染：懒加载官方 Excalidraw 组件（编辑态可绘图，只读态 viewModeEnabled）；
 * - 存储：三种策略（内联 / 远程 / Delta）由节点数据承载，远端读写走宿主注入的存储适配器；
 * - 工具栏「点击即插入」：优先替换空段落，否则插到当前块之后，无光标则追加到文末；
 * - Markdown：```whiteboard 围栏（需排在代码块转换器之前）。
 */
export const whiteboardPlugin: EditorPlugin = {
  name: 'whiteboard',
  nodes: [WhiteboardEditNode],
  transformers: WHITEBOARD_TRANSFORMERS,
  toolbar: [
    {
      id: 'whiteboard',
      label: <Frame size={16} />,
      title: '插入 Excalidraw 白板',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return $isWhiteboardNode(selection.anchor.getNode().getTopLevelElement());
      },
      run: (editor) => {
        editor.update(() => {
          const selection = $getSelection();
          const anchorBlock = $isRangeSelection(selection)
            ? selection.anchor.getNode().getTopLevelElement()
            : null;

          const emptyParagraph =
            anchorBlock && $isParagraphNode(anchorBlock) && anchorBlock.getTextContent().trim() === '';

          const node = $createWhiteboardEditNode();

          if (emptyParagraph && anchorBlock) {
            anchorBlock.replace(node);
          } else if (anchorBlock && !$isWhiteboardNode(anchorBlock)) {
            anchorBlock.insertAfter(node);
          } else {
            $getRoot().append(node);
          }

          // 白板后补一个空段落，方便继续在下方书写
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
        });
      },
    },
  ],
};

export { $createWhiteboardNode, $isWhiteboardNode, WhiteboardNode } from './WhiteboardNode.js';
export { WhiteboardEditNode, $createWhiteboardEditNode, $isWhiteboardEditNode } from './WhiteboardEditNode.js';
export type { SerializedWhiteboardNode, WhiteboardMode } from './WhiteboardNode.js';
export { WHITEBOARD_TRANSFORMERS } from './transformer.js';
export { WhiteboardStorageProvider, useWhiteboardStorage } from './storage.js';
export type { WhiteboardStorage } from './storage.js';
export {
  applyJsonPatch,
  diffScenes,
  emptyScene,
  normalizeScene,
  parseScene,
  pickAppState,
  resolveDeltaScene,
  stringifyScene,
} from './scene.js';
export type { JsonPatchOp, WhiteboardElement, WhiteboardScene } from './scene.js';

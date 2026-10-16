import { $createParagraphNode, $getRoot, $getSelection, $isParagraphNode, $isRangeSelection } from 'lexical';
import { Link as LinkIcon } from 'lucide-react';
import type { EditorPlugin } from '../../types.js';
import { $createLinkCardEditNode, LinkCardEditNode } from './LinkCardEditNode.js';
import { $isLinkCardNode } from './LinkCardNode.js';
import { LINKCARD_TRANSFORMERS } from './transformer.js';
import { registerBuiltinMatchers } from './matchers/index.js';

// 模块加载时注册内置 matcher（幂等，重复注册不影响）
registerBuiltinMatchers();

/**
 * Link Card 插件。
 * - 工具栏按钮打开 URL 输入对话框，插入 linkcard 节点；
 * - 输入快捷键 `:::linkcard <url>` 自动替换当前段落；
 * - 渲染组件负责 client-side fetch + 持久化 data 到 JSON。
 */
export const linkCardPlugin: EditorPlugin = {
  name: 'linkCard',
  nodes: [LinkCardEditNode],
  transformers: LINKCARD_TRANSFORMERS,
  toolbar: [
    {
      id: 'linkCard',
      label: <LinkIcon size={16} />,
      title: '插入链接卡片',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return $isLinkCardNode(selection.anchor.getNode().getTopLevelElement());
      },
      run: (editor) => {
        const url = prompt('请输入链接地址：');
        if (!url) return;
        editor.update(() => {
          const selection = $getSelection();
          const anchorBlock = $isRangeSelection(selection)
            ? selection.anchor.getNode().getTopLevelElement()
            : null;

          const emptyParagraph =
            anchorBlock && $isParagraphNode(anchorBlock) && anchorBlock.getTextContent().trim() === '';

          const node = $createLinkCardEditNode(url.trim());

          if (emptyParagraph && anchorBlock) {
            anchorBlock.replace(node);
          } else if (anchorBlock && !$isLinkCardNode(anchorBlock)) {
            anchorBlock.insertAfter(node);
          } else {
            $getRoot().append(node);
          }

          // 卡片后补一个空段落，方便继续书写
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
        });
      },
    },
  ],
};

export {
  $createLinkCardNode,
  $isLinkCardNode,
  LinkCardNode,
  LINK_CARD_SHAPES,
  normalizeLinkCardShape,
} from './LinkCardNode.js';
export { $createLinkCardEditNode, $isLinkCardEditNode, LinkCardEditNode } from './LinkCardEditNode.js';
export type { LinkCardShape, LinkCardData, SerializedLinkCardNode } from './LinkCardNode.js';
export { LINKCARD_TRANSFORMERS } from './transformer.js';
export {
  registerMatcher,
  unregisterMatcher,
  listMatchers,
  findMatcherForUrl,
  registerBuiltinMatchers,
} from './matchers/index.js';
export type { LinkCardMatcher } from './matchers/index.js';

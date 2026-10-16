import { $createParagraphNode, $getRoot, $getSelection, $isParagraphNode, $isRangeSelection } from 'lexical';
import { Lightbulb } from 'lucide-react';
import type { EditorPlugin } from '../../types';
import { $createBannerNode, $isBannerNode, BannerNode, type BannerType } from './BannerNode';
import { BANNER_TRANSFORMERS } from './transformer';
import { BannerToolbar } from './BannerToolbar';

/**
 * Banner 提示块（info / success / warning / error）。
 * - 块级 ElementNode，内部可编辑富文本；
 * - 工具栏按钮「点击即插入」：新建一个空提示块并把光标落进去，无需先选中内容；
 *   光标所在处为空段落时直接替换该段落，否则插到当前块之后，无光标则追加到文末；
 * - 选中 banner 内任意位置时，顶部出现类型切换工具条，可实时切换类型；
 * - Markdown：::: type ... :::。
 */
export const bannerPlugin: EditorPlugin = {
  name: 'banner',
  nodes: [BannerNode],
  transformers: BANNER_TRANSFORMERS,
  toolbar: [
    {
      id: 'banner',
      label: <Lightbulb size={16} />,
      title: '插入提示块',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        const block = selection.anchor.getNode().getTopLevelElement();
        return $isBannerNode(block);
      },
      run: (editor) => {
        editor.update(() => {
          const type: BannerType = 'info';
          const banner = $createBannerNode(type);
          const paragraph = $createParagraphNode();
          banner.append(paragraph);

          // 取光标所在的顶层块（没有选区时为 null）
          const selection = $getSelection();
          const anchorBlock = $isRangeSelection(selection)
            ? selection.anchor.getNode().getTopLevelElement()
            : null;

          if (anchorBlock && $isParagraphNode(anchorBlock) && anchorBlock.getTextContent().trim() === '') {
            // 空段落：直接替换，避免残留空行
            anchorBlock.replace(banner);
          } else if (anchorBlock && !$isBannerNode(anchorBlock)) {
            // 已有内容：插到当前块之后，不破坏原有内容
            anchorBlock.insertAfter(banner);
          } else {
            // 无光标或已在 banner 内：追加到文末
            $getRoot().append(banner);
          }

          // banner 后补一个空段落，方便继续在下方书写
          banner.insertAfter($createParagraphNode());

          // 光标落入 banner 内，立即可编辑
          paragraph.select();
        });
      },
    },
  ],
  render: () => <BannerToolbar />,
};

export {
  $createBannerNode,
  $isBannerNode,
  BannerNode,
  BANNER_TYPES,
  type BannerType,
  type SerializedBannerNode,
} from './BannerNode';
export { BANNER_TRANSFORMERS } from './transformer';
export { BANNER_TYPE_META } from './BannerToolbar';

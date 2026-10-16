import { $createParagraphNode, $getRoot, $getSelection, $isParagraphNode, $isRangeSelection } from 'lexical';
import { Images } from 'lucide-react';
import type { EditorPlugin } from '../../types';
import { $createGalleryNode, $isGalleryNode, GalleryNode } from './GalleryNode';
import { GALLERY_TRANSFORMERS } from './transformer';

/**
 * 图库块（Grid / Masonry / Carousel 三种布局 + 灯箱）。
 * - 渲染与图片上传都在 GalleryComponent / GalleryModal 中完成；
 * - 工具栏「点击即插入」：优先替换空段落，否则插到当前块之后，无光标则追加到文末；
 * - 新插入的空图库会自动打开编辑模态框；
 * - Markdown：:::gallery 容器（与代码块的 :::code-group 语法互不重叠）。
 */
export const galleryPlugin: EditorPlugin = {
  name: 'gallery',
  nodes: [GalleryNode],
  transformers: GALLERY_TRANSFORMERS,
  toolbar: [
    {
      id: 'gallery',
      label: <Images size={16} />,
      title: '插入图库',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return $isGalleryNode(selection.anchor.getNode().getTopLevelElement());
      },
      run: (editor) => {
        editor.update(() => {
          const selection = $getSelection();
          const anchorBlock = $isRangeSelection(selection)
            ? selection.anchor.getNode().getTopLevelElement()
            : null;

          const emptyParagraph =
            anchorBlock && $isParagraphNode(anchorBlock) && anchorBlock.getTextContent().trim() === '';

          const node = $createGalleryNode();

          if (emptyParagraph && anchorBlock) {
            anchorBlock.replace(node);
          } else if (anchorBlock && !$isGalleryNode(anchorBlock)) {
            anchorBlock.insertAfter(node);
          } else {
            $getRoot().append(node);
          }

          // 图库后补一个空段落，方便继续在下方书写
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
        });
      },
    },
  ],
};

export { $createGalleryNode, $isGalleryNode, GalleryNode, GALLERY_LAYOUTS, normalizeGalleryImages, normalizeGalleryLayout } from './GalleryNode';
export type { GalleryImage, GalleryLayout, SerializedGalleryNode } from './GalleryNode';
export { GALLERY_TRANSFORMERS } from './transformer';
export { GalleryStorageProvider, useGalleryStorage } from './storage';
export type { GalleryStorage } from './storage';

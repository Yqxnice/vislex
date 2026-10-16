import { $createParagraphNode, type ElementNode, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import {
  $createGalleryNode,
  $isGalleryNode,
  GalleryNode,
  normalizeGalleryLayout,
  type GalleryImage,
} from './GalleryNode';

/**
 * 图库 Markdown 往返。
 *
 * 格式：:::gallery grid
 *       ![alt](src "caption")
 *       ![alt2](src2)
 *       :::
 *
 * 布局：grid / masonry / carousel（大小写不敏感，缺省 grid）。
 * 服务端 core 内有一份同构副本（格式需保持一致）。
 */

const GALLERY_START_REGEX = /^[ \t]*:::gallery\s*(grid|masonry|carousel)?\s*$/i;
const GALLERY_END_REGEX = /^[ \t]*:::[ \t]*$/;
/** 标准 Markdown 图片语法，标题（caption）可选并支持转义引号 */
const IMAGE_LINE_REGEX = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"((?:\\.|[^"\\])*)")?\)\s*$/;

function escapeCaption(caption: string): string {
  return caption.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function unescapeCaption(caption: string): string {
  return caption.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

function parseImageLine(line: string): GalleryImage | null {
  const match = IMAGE_LINE_REGEX.exec(line.trim());
  if (!match) return null;
  const src = match[2].trim();
  if (!src) return null;
  const caption = match[3] ? unescapeCaption(match[3]) : '';
  return {
    src,
    alt: match[1] || undefined,
    caption: caption || undefined,
  };
}

const galleryTransformer: MultilineElementTransformer = {
  type: 'multiline-element',
  dependencies: [GalleryNode],
  regExpStart: GALLERY_START_REGEX,
  regExpEnd: { optional: true, regExp: GALLERY_END_REGEX },

  export: (node: LexicalNode) => {
    if (!$isGalleryNode(node)) return null;
    const lines = node.getImages().map((image) => {
      const alt = image.alt ?? '';
      const caption = image.caption ? ` "${escapeCaption(image.caption)}"` : '';
      return `![${alt}](${image.src}${caption})`;
    });
    return `:::gallery ${node.getLayout()}\n${lines.join('\n')}\n:::`;
  },

  replace: (
    rootNode: ElementNode,
    children: LexicalNode[] | null,
    startMatch: string[],
    _endMatch: string[] | null,
    linesInBetween: string[] | null,
    isImport: boolean,
  ) => {
    const layout = normalizeGalleryLayout(startMatch[1]);

    // 导入：linesInBetween[0] 是起始行剩余部分，空白则丢弃
    if (!children && linesInBetween) {
      const lines = [...linesInBetween];
      if (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
      while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) lines.pop();
      const images: GalleryImage[] = [];
      for (const line of lines) {
        const image = parseImageLine(line);
        if (image) images.push(image);
      }
      rootNode.append($createGalleryNode(layout, images));
      return true;
    }

    // 输入快捷键：把当前段落替换成空图库，光标落到后面的新段落
    if (children) {
      if (!isImport) {
        const node = $createGalleryNode(layout, []);
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

export const GALLERY_TRANSFORMERS: MultilineElementTransformer[] = [galleryTransformer];

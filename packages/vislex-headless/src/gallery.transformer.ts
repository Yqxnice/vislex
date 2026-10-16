/**
 * 图库 Markdown 转换器（headless / editor 共用单一实现）。
 * 通过 createGalleryTransformers(deps) 注入当前环境注册的节点类。
 *
 * 格式：:::gallery grid
 *       ![alt](src "caption")
 *       ![alt2](src2)
 *       :::
 *
 * 布局：grid / masonry / carousel（大小写不敏感，缺省 grid）。
 */

import { $createParagraphNode, type ElementNode, type Klass, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import type { GalleryImage, GalleryLayout, GalleryNode } from './gallery.node.js';
import {
  $createGalleryNode,
  $isGalleryNode,
  GalleryNode as HeadlessGalleryNode,
  normalizeGalleryLayout,
} from './gallery.node.js';

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

export interface GalleryTransformersDeps {
  GalleryNode: Klass<LexicalNode>;
  createGalleryNode: (layout: GalleryLayout, images: GalleryImage[]) => LexicalNode;
  isGalleryNode: (node: LexicalNode | null | undefined) => boolean;
  normalizeLayout: (raw: unknown) => GalleryLayout;
}

export function createGalleryTransformers(
  deps: GalleryTransformersDeps,
): MultilineElementTransformer[] {
  const galleryTransformer: MultilineElementTransformer = {
    type: 'multiline-element',
    dependencies: [deps.GalleryNode],
    regExpStart: GALLERY_START_REGEX,
    regExpEnd: { optional: true, regExp: GALLERY_END_REGEX },

    export: (node: LexicalNode) => {
      if (!deps.isGalleryNode(node)) return null;
      const n = node as GalleryNode;
      const lines = n.getImages().map((image) => {
        const alt = image.alt ?? '';
        const caption = image.caption ? ` "${escapeCaption(image.caption)}"` : '';
        return `![${alt}](${image.src}${caption})`;
      });
      return `:::gallery ${n.getLayout()}\n${lines.join('\n')}\n:::`;
    },

    replace: (
      rootNode: ElementNode,
      children: LexicalNode[] | null,
      startMatch: string[],
      _endMatch: string[] | null,
      linesInBetween: string[] | null,
      isImport: boolean,
    ) => {
      const layout = deps.normalizeLayout(startMatch[1]);

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
        rootNode.append(deps.createGalleryNode(layout, images));
        return true;
      }

      // 输入快捷键：把当前段落替换成空图库，光标落到后面的新段落
      if (children) {
        if (!isImport) {
          const node = deps.createGalleryNode(layout, []);
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

  return [galleryTransformer];
}

/** headless 默认绑定（零 React 节点） */
export const GALLERY_TRANSFORMERS: MultilineElementTransformer[] = createGalleryTransformers({
  GalleryNode: HeadlessGalleryNode,
  createGalleryNode: $createGalleryNode,
  isGalleryNode: $isGalleryNode,
  normalizeLayout: normalizeGalleryLayout,
});

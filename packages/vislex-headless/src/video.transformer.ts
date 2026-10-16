/**
 * 视频 Markdown 转换器（headless / editor 共用单一实现）。
 * 通过 createVideoTransformers(deps) 注入当前环境注册的节点类。
 *
 * 格式：:::video <src>
 *       poster: <url>   （可选行）
 *       title: <text>   （可选行）
 *       :::
 *
 * 单行也支持（与 linkcard 同形态）：:::video https://example.com/movie.mp4
 */

import { $createParagraphNode, type ElementNode, type Klass, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import type { VideoNode } from './video.node.js';
import { $createVideoNode, $isVideoNode, VideoNode as HeadlessVideoNode } from './video.node.js';

const VIDEO_START_REGEX = /^[ \t]*:::video\s+(\S+)\s*$/i;
const VIDEO_END_REGEX = /^[ \t]*:::[ \t]*$/;
const POSTER_LINE_REGEX = /^[ \t]*poster[ \t]*:[ \t]*(.+)$/i;
const TITLE_LINE_REGEX = /^[ \t]*title[ \t]*:[ \t]*(.+)$/i;

function parseMetaLines(lines: string[]): { poster?: string; title?: string } {
  let poster: string | undefined;
  let title: string | undefined;
  for (const line of lines) {
    const posterMatch = POSTER_LINE_REGEX.exec(line);
    if (posterMatch) {
      poster = posterMatch[1].trim();
      continue;
    }
    const titleMatch = TITLE_LINE_REGEX.exec(line);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }
  return { poster, title };
}

export interface VideoTransformersDeps {
  VideoNode: Klass<LexicalNode>;
  createVideoNode: (src: string) => LexicalNode;
  isVideoNode: (node: LexicalNode | null | undefined) => boolean;
}

export function createVideoTransformers(deps: VideoTransformersDeps): MultilineElementTransformer[] {
  const videoTransformer: MultilineElementTransformer = {
    type: 'multiline-element',
    dependencies: [deps.VideoNode],
    regExpStart: VIDEO_START_REGEX,
    regExpEnd: { optional: true, regExp: VIDEO_END_REGEX },

    export: (node: LexicalNode) => {
      if (!deps.isVideoNode(node)) return null;
      const n = node as VideoNode;
      const lines = [`:::video ${n.getSrc()}`];
      const poster = n.getPoster();
      if (poster) lines.push(`poster: ${poster}`);
      const title = n.getTitle();
      if (title) lines.push(`title: ${title}`);
      lines.push(':::');
      return lines.join('\n');
    },

    replace: (
      rootNode: ElementNode,
      children: LexicalNode[] | null,
      startMatch: string[],
      _endMatch: string[] | null,
      linesInBetween: string[] | null,
      isImport: boolean,
    ) => {
      const src = startMatch[1]?.trim() ?? '';
      if (!src) return false;
      const { poster, title } = parseMetaLines(linesInBetween ?? []);

      const node = deps.createVideoNode(src) as VideoNode;
      node.setPoster(poster);
      node.setTitle(title);

      if (!isImport && children) {
        // 输入快捷键：把当前段落替换成视频，光标落到新段落
        rootNode.replace(node);
        const paragraph = $createParagraphNode();
        node.insertAfter(paragraph);
        paragraph.select();
        return true;
      }

      // 导入
      rootNode.append(node);
      return true;
    },
  };

  return [videoTransformer];
}

/** headless 默认绑定（零 React 节点） */
export const VIDEO_TRANSFORMERS: MultilineElementTransformer[] = createVideoTransformers({
  VideoNode: HeadlessVideoNode,
  createVideoNode: $createVideoNode,
  isVideoNode: $isVideoNode,
});

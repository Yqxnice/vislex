import { $createParagraphNode, type ElementNode, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import { $createVideoNode, $isVideoNode, VideoNode } from './VideoNode';

/**
 * 视频 Markdown 往返。
 *
 * 格式：:::video <src>
 *       poster: <url>   （可选行）
 *       title: <text>   （可选行）
 *       :::
 *
 * 单行也支持（与 linkcard 同形态）：:::video https://example.com/movie.mp4
 *
 * 服务端 core 内有一份同构副本（格式需保持一致）。
 */

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

const videoTransformer: MultilineElementTransformer = {
  type: 'multiline-element',
  dependencies: [VideoNode],
  regExpStart: VIDEO_START_REGEX,
  regExpEnd: { optional: true, regExp: VIDEO_END_REGEX },

  export: (node: LexicalNode) => {
    if (!$isVideoNode(node)) return null;
    const lines = [`:::video ${node.getSrc()}`];
    const poster = node.getPoster();
    if (poster) lines.push(`poster: ${poster}`);
    const title = node.getTitle();
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

    if (!isImport && children) {
      // 输入快捷键：把当前段落替换成视频，光标落到新段落
      const node = $createVideoNode(src);
      node.setPoster(poster);
      node.setTitle(title);
      rootNode.replace(node);
      const paragraph = $createParagraphNode();
      node.insertAfter(paragraph);
      paragraph.select();
      return true;
    }

    // 导入
    const node = $createVideoNode(src);
    node.setPoster(poster);
    node.setTitle(title);
    rootNode.append(node);
    return true;
  },
};

export const VIDEO_TRANSFORMERS: MultilineElementTransformer[] = [videoTransformer];

import { $createParagraphNode, $isElementNode, type ElementNode, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import { $convertFromMarkdownString, HEADING, QUOTE, UNORDERED_LIST, ORDERED_LIST, BOLD_STAR, BOLD_ITALIC_STAR, ITALIC_STAR, STRIKETHROUGH, INLINE_CODE, LINK } from '@lexical/markdown';
import { $createBannerNode, $isBannerNode, BannerNode, BANNER_TYPES, type BannerType } from './BannerNode';

/**
 * Banner Markdown 往返。
 *
 * 格式：::: type
 *       内容
 *       :::
 *
 * type: info / success / warning / error（大小写不敏感）。
 * 内容按段落解析，支持加粗/斜体/列表等行内与块级格式。
 */

const BANNER_START_REGEX = /^[ \t]*:::\s*(info|success|warning|error)\s*$/i;
const BANNER_END_REGEX = /^[ \t]*:::\s*$/;

function normalizeType(raw: string): BannerType {
  const lower = raw.toLowerCase();
  return (BANNER_TYPES as string[]).includes(lower) ? (lower as BannerType) : 'info';
}

/** Banner 内部支持的 Markdown 转换器子集（不含代码块/公式，避免嵌套复杂化） */
const INNER_TRANSFORMERS = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  BOLD_STAR,
  BOLD_ITALIC_STAR,
  ITALIC_STAR,
  STRIKETHROUGH,
  INLINE_CODE,
  LINK,
];

const bannerTransformer: MultilineElementTransformer = {
  type: 'multiline-element',
  dependencies: [BannerNode],
  regExpStart: BANNER_START_REGEX,
  regExpEnd: { optional: true, regExp: BANNER_END_REGEX },

  export: (node: LexicalNode, traverseChildren) => {
    if (!$isBannerNode(node)) return null;
    const inner = traverseChildren(node);
    return `::: ${node.getBannerType()}\n${inner}\n:::`;
  },

  replace: (
    rootNode: ElementNode,
    children: LexicalNode[] | null,
    startMatch: string[],
    _endMatch: string[] | null,
    linesInBetween: string[] | null,
    isImport: boolean,
  ) => {
    const type = normalizeType(startMatch[1]);

    // 输入快捷键：:::info 等触发，插入带空段落的 banner
    if (!isImport && children) {
      const banner = $createBannerNode(type);
      banner.append($createParagraphNode());
      rootNode.replace(banner);
      // 光标落到 banner 内的段落
      const firstChild = banner.getFirstChild();
      if ($isElementNode(firstChild)) firstChild.select();
      return true;
    }

    if (!linesInBetween) return false;

    const lines = [...linesInBetween];
    // 去掉首尾空行
    while (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
    while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) lines.pop();

    const banner = $createBannerNode(type);
    rootNode.append(banner);

    if (lines.length === 0) {
      banner.append($createParagraphNode());
      return true;
    }

    // 把内容作为 Markdown 解析进 banner（临时 root）
    const innerMarkdown = lines.join('\n');
    $convertFromMarkdownString(innerMarkdown, INNER_TRANSFORMERS, banner);

    // 确保 banner 至少有一个段落
    if (banner.getChildrenSize() === 0) {
      banner.append($createParagraphNode());
    }
    return true;
  },
};

export const BANNER_TRANSFORMERS: MultilineElementTransformer[] = [bannerTransformer];

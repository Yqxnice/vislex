/**
 * Banner Markdown 转换器（headless / editor 共用单一实现）。
 * 通过 createBannerTransformers(deps) 注入当前环境注册的节点类。
 *
 * 格式：::: type
 *       内容
 *       :::
 */

import {
  $createParagraphNode,
  $isElementNode,
  type ElementNode,
  type Klass,
  type LexicalNode,
} from 'lexical';
import {
  $convertFromMarkdownString,
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  LINK,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  UNORDERED_LIST,
} from '@lexical/markdown';
import type { MultilineElementTransformer } from '@lexical/markdown';
import type { BannerNode, BannerType } from './banner.node.js';
import {
  $createBannerNode,
  $isBannerNode,
  BANNER_TYPES,
  BannerNode as HeadlessBannerNode,
} from './banner.node.js';

const BANNER_START_REGEX = /^[ \t]*:::\s*(info|success|warning|error)\s*$/i;
const BANNER_END_REGEX = /^[ \t]*:::\s*$/;

function normalizeType(raw: string): BannerType {
  const lower = raw.toLowerCase();
  return (BANNER_TYPES as string[]).includes(lower) ? (lower as BannerType) : 'info';
}

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

export interface BannerTransformersDeps {
  BannerNode: Klass<LexicalNode>;
  createBannerNode: (type?: BannerType) => LexicalNode;
  isBannerNode: (node: LexicalNode | null | undefined) => boolean;
}

export function createBannerTransformers(deps: BannerTransformersDeps): MultilineElementTransformer[] {
  const bannerTransformer: MultilineElementTransformer = {
    type: 'multiline-element',
    dependencies: [deps.BannerNode],
    regExpStart: BANNER_START_REGEX,
    regExpEnd: { optional: true, regExp: BANNER_END_REGEX },

    export: (node: LexicalNode, traverseChildren) => {
      if (!deps.isBannerNode(node)) return null;
      const bannerNode = node as BannerNode;
      const inner = traverseChildren(bannerNode);
      return `::: ${bannerNode.getBannerType()}\n${inner}\n:::`;
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

      if (!isImport && children) {
        const banner = deps.createBannerNode(type) as BannerNode;
        banner.append($createParagraphNode());
        rootNode.replace(banner);
        const firstChild = banner.getFirstChild();
        if ($isElementNode(firstChild)) firstChild.select();
        return true;
      }

      if (!linesInBetween) return false;

      const lines = [...linesInBetween];
      while (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
      while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) lines.pop();

      const banner = deps.createBannerNode(type) as BannerNode;
      rootNode.append(banner);

      if (lines.length === 0) {
        banner.append($createParagraphNode());
        return true;
      }

      const innerMarkdown = lines.join('\n');
      $convertFromMarkdownString(innerMarkdown, INNER_TRANSFORMERS, banner);

      if (banner.getChildrenSize() === 0) {
        banner.append($createParagraphNode());
      }
      return true;
    },
  };

  return [bannerTransformer];
}

/** headless 默认绑定（零 React 节点） */
export const BANNER_TRANSFORMERS: MultilineElementTransformer[] = createBannerTransformers({
  BannerNode: HeadlessBannerNode,
  createBannerNode: $createBannerNode,
  isBannerNode: $isBannerNode,
});

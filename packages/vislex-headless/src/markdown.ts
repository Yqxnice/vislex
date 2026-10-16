/**
 * Headless Lexical Markdown 高层 API。
 *
 * 在 Node.js（或任意无 DOM 环境）操作 Lexical EditorState JSON：
 * 1. jsonToMarkdown(editorStateJson) → string   — 给展示端输出 Markdown
 * 2. markdownToEditorState(markdown) → object   — Markdown 迁移成 JSON
 * 3. extractTranslatableBlocks(editorStateJson) — 块级抽取，给翻译服务用
 * 4. applyTranslations(editorStateJson, ...)    — 把译文塞回 JSON 对象
 *
 * 转换器排序与 @vislex/editor 编辑器侧一致（见 MARKDOWN_TRANSFORMERS）。
 */

import { createHeadlessEditor } from '@lexical/headless';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
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
  type Transformer,
} from '@lexical/markdown';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';

import { CodeBlockNode } from './code-block.node.js';
import { CODE_BLOCK_TRANSFORMERS } from './code-block.transformer.js';
import { MermaidNode } from './mermaid.node.js';
import { MERMAID_TRANSFORMERS } from './mermaid.transformer.js';
import { BlockMathNode } from './math-block.node.js';
import { InlineMathNode } from './math-inline.node.js';
import { MATH_TRANSFORMERS } from './math.transformer.js';
import { BannerNode } from './banner.node.js';
import { BANNER_TRANSFORMERS } from './banner.transformer.js';
import { WhiteboardNode } from './whiteboard.node.js';
import { WHITEBOARD_TRANSFORMERS } from './whiteboard.transformer.js';
import { GalleryNode } from './gallery.node.js';
import { GALLERY_TRANSFORMERS } from './gallery.transformer.js';
import { LinkCardNode } from './linkcard.node.js';
import { LINKCARD_TRANSFORMERS } from './linkcard.transformer.js';
import { VideoNode } from './video.node.js';
import { VIDEO_TRANSFORMERS } from './video.transformer.js';
import { EmbedNode } from './embed.node.js';
import { EMBED_TRANSFORMERS } from './embed.transformer.js';
import { MentionNode } from './mention.node.js';
import { MENTION_TRANSFORMERS } from './mention.transformer.js';
import { RubyNode } from './ruby.node.js';
import { RUBY_TRANSFORMERS } from './ruby.transformer.js';
import { TABLE_TRANSFORMERS } from './table.transformer.js';
import {
  ALIGN_HEADING_TRANSFORMER,
  ALIGN_PARAGRAPH_TRANSFORMER,
  ALIGN_QUOTE_TRANSFORMER,
} from './align.transformer.js';

/** headless editor 支持的全部 Markdown 转换器（顺序权威，编辑器侧接线必须与此一致） */
export const MARKDOWN_TRANSFORMERS: Transformer[] = [
  ...MERMAID_TRANSFORMERS,
  ...WHITEBOARD_TRANSFORMERS,
  ...GALLERY_TRANSFORMERS,
  ...LINKCARD_TRANSFORMERS,
  ...VIDEO_TRANSFORMERS,
  ...EMBED_TRANSFORMERS,
  ...TABLE_TRANSFORMERS,
  ...CODE_BLOCK_TRANSFORMERS,
  ...MATH_TRANSFORMERS,
  ...BANNER_TRANSFORMERS,
  // 对齐转换器（块尾 {:align} 标记）：标题 / 引用必须先于内置 HEADING / QUOTE，
  // 段落必须排在列表之后，避免吞掉尾部带标记的列表行
  ALIGN_HEADING_TRANSFORMER,
  ALIGN_QUOTE_TRANSFORMER,
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  ALIGN_PARAGRAPH_TRANSFORMER,
  BOLD_STAR,
  BOLD_ITALIC_STAR,
  ITALIC_STAR,
  STRIKETHROUGH,
  INLINE_CODE,
  // mention / ruby 为 text-match，必须排在内置 LINK 之前，否则被普通链接吞掉
  ...RUBY_TRANSFORMERS,
  ...MENTION_TRANSFORMERS,
  LINK,
];

/** @lexical 内置节点 + 自定义节点的完整注册表（headless editor 用） */
export const HEADLESS_NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  CodeBlockNode,
  MermaidNode,
  WhiteboardNode,
  GalleryNode,
  LinkCardNode,
  VideoNode,
  EmbedNode,
  MentionNode,
  RubyNode,
  InlineMathNode,
  BlockMathNode,
  BannerNode,
];

/** 空 EditorState JSON（空 root），空正文统一存这个结构 */
export const EMPTY_EDITOR_STATE = { root: { children: [], type: 'root', version: 1 } };

/** 需要整体翻译的块级元素类型 */
const BLOCK_TYPES = new Set(['paragraph', 'heading', 'quote', 'listitem']);

function makeHeadless(onError?: (e: unknown) => void) {
  return createHeadlessEditor({
    nodes: HEADLESS_NODES,
    onError: onError ?? (() => {}),
  });
}

/**
 * 把 Lexical EditorState JSON 对象转成 Markdown 字符串。
 * 用于：博客展示端输出 Markdown、翻译时作为 fallback 展示。
 *
 * @param content - Prisma Json 字段，已经是 parse 后的对象
 */
export function jsonToMarkdown(content: unknown): string {
  if (!content || typeof content !== 'object') return '';
  const jsonStr = JSON.stringify(content);
  const editor = makeHeadless();
  try {
    editor.setEditorState(editor.parseEditorState(jsonStr));
  } catch {
    return ''; // JSON 无效时返回空
  }
  let md = '';
  editor.update(() => {
    md = $convertToMarkdownString(MARKDOWN_TRANSFORMERS, undefined, true);
  });
  return md;
}

/**
 * 把 Markdown 字符串转成 Lexical EditorState JSON 对象（jsonToMarkdown 的逆操作）。
 * 用于：把阶段一遗留的 Markdown 正文迁移成 JSON 存储。
 *
 * 两个关键点（已实测）：
 * 1. headless 普通 update() 的变更不会立刻反映到 getEditorState()，必须传 { discrete: true } 同步提交；
 * 2. Markdown 结尾的换行会被解析出一个多余的空段落，故先 trimEnd 掉尾部空白。
 */
export function markdownToEditorState(markdown: string): Record<string, unknown> {
  const trimmed = markdown.replace(/\s+$/, '');
  if (!trimmed) return EMPTY_EDITOR_STATE;
  const editor = makeHeadless();
  editor.update(
    () => {
      $convertFromMarkdownString(trimmed, MARKDOWN_TRANSFORMERS, undefined, true);
    },
    { discrete: true },
  );
  return editor.getEditorState().toJSON() as unknown as Record<string, unknown>;
}

// ===== 块级抽取 =====

export interface TranslatableBlock {
  /** 块在 JSON 对象里的路径（用于后续塞回） */
  path: Array<string | number>;
  /** 块的类型：paragraph / heading / quote / listitem */
  blockType: string;
  /** 块内所有直接子 TextNode 拼接后的纯文本 */
  text: string;
}

/**
 * 从 Lexical EditorState JSON 对象里抽取所有可翻译块。
 * 遍历 paragraph/heading/quote/listitem 四类块级元素，
 * 每块内收集所有直接子 TextNode 的文本拼接成一段。
 *
 * @param content - Prisma Json 字段，parse 后的 EditorState 对象
 */
export function extractTranslatableBlocks(content: unknown): TranslatableBlock[] {
  if (!content || typeof content !== 'object') return [];
  const root = (content as Record<string, unknown>).root;
  if (!root) return [];

  const blocks: TranslatableBlock[] = [];
  const walk = (node: unknown, path: Array<string | number>): void => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, [...path, i]));
      return;
    }
    const n = node as Record<string, unknown>;
    const type = n.type as string | undefined;

    if (type && BLOCK_TYPES.has(type) && Array.isArray(n.children) && n.children.length > 0) {
      const textParts: string[] = [];
      for (const child of n.children) {
        if (child && typeof child === 'object' && (child as Record<string, unknown>).type === 'text') {
          textParts.push(String((child as Record<string, unknown>).text ?? ''));
        }
      }
      if (textParts.length > 0) {
        blocks.push({ path, blockType: type, text: textParts.join('') });
      }
    }

    if (Array.isArray(n.children)) {
      n.children.forEach((child, i) => walk(child, [...path, 'children', i]));
    }
  };
  walk(root, []);
  return blocks;
}

/**
 * 把译文块塞回 JSON 对象。
 * 对每个译文：定位到原块路径 → 找到块内第一个 TextNode → 替换 text → 删除后续连续 TextNode。
 * 这样做的代价是块内格式（加粗/斜体）会丢失，但这是阶段二的 MVP 策略，
 * 阶段三可以引入格式保留（先译 Markdown 格式标记，再回填）。
 *
 * @param content - parse 后的 EditorState 对象（会被原地修改，调用方也应同时替换引用）
 * @param blocks - 原始抽取的块数组（用于定位路径）
 * @param translations - 按 blocks 顺序排列的译文数组
 * @returns 修改后的 JSON 对象（与 content 同一引用）
 */
export function applyTranslations(
  content: unknown,
  blocks: TranslatableBlock[],
  translations: string[],
): unknown {
  if (!content || typeof content !== 'object') return content;
  if (blocks.length !== translations.length) {
    throw new Error(`块数量 (${blocks.length}) 与译文数量 (${translations.length}) 不匹配`);
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const newText = translations[i];
    if (!newText) continue;
    replaceBlockText(content, block.path, newText);
  }
  return content;
}

function replaceBlockText(
  root: unknown,
  path: Array<string | number>,
  newText: string,
): void {
  let cur: unknown = root;
  for (const key of path) {
    if (typeof cur === 'object' && cur !== null) {
      cur = (cur as Record<string | number, unknown>)[key as string];
    } else {
      return;
    }
  }
  const blockNode = cur as Record<string, unknown>;
  if (!blockNode || typeof blockNode !== 'object') return;

  const children = blockNode.children as Array<Record<string, unknown>> | undefined;
  if (!children || children.length === 0) return;

  let firstTextIdx = -1;
  for (let i = 0; i < children.length; i++) {
    if (children[i].type === 'text') {
      firstTextIdx = i;
      break;
    }
  }
  if (firstTextIdx === -1) return;

  // 替换第一个 TextNode 的 text，删除后续所有 TextNode（保留 inline 元素）
  children[firstTextIdx] = { ...children[firstTextIdx], text: newText };
  for (let i = children.length - 1; i > firstTextIdx; i--) {
    if (children[i].type === 'text') {
      children.splice(i, 1);
    }
  }
}

import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  IS_BOLD,
  IS_CODE,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_SUBSCRIPT,
  IS_SUPERSCRIPT,
  IS_UNDERLINE,
  type ElementNode,
  type LexicalNode,
} from 'lexical';
import { $createHeadingNode, $createQuoteNode, type HeadingTagType } from '@lexical/rich-text';
import { $createListItemNode, $createListNode, $isListItemNode } from '@lexical/list';
import { $createLinkNode } from '@lexical/link';
import {
  $createTableNode,
  $createTableRowNode,
  $createTableCellNode,
  TableCellHeaderStates,
} from '@lexical/table';
import { $createCodeBlockNode, type CodeFile } from '../codeBlock/CodeBlockNode';
import { $createMermaidNode } from '../mermaid/MermaidNode';
import { $createBlockMathNode } from '../math/BlockMathNode';
import { $createInlineMathNode } from '../math/InlineMathNode';
import { $createBannerNode, type BannerType } from '../banner/BannerNode';
import { $createWhiteboardNode, type WhiteboardMode } from '../whiteboard/WhiteboardNode';
import {
  $createGalleryNode,
  normalizeGalleryLayout,
  type GalleryImage,
} from '../gallery/GalleryNode';
import { $createVideoNode } from '../video/VideoNode';
import { $createEmbedNode } from '../embed/EmbedNode';
import { $createMentionNode } from '../mention/MentionNode';
import { $createRubyNode } from '../ruby/RubyNode';

/**
 * LiteXML → Lexical 节点（纯文本 XML 导入路径，编辑器实例级）。
 *
 * 词汇表的权威规格与「EditorState JSON ↔ XML」纯双向转换见 litexml.bridge.ts；
 * 本文件保留实例级导入（DOM walk + 选区插入 + 行内上下文降级），标签语义与桥保持一致。
 *
 * LiteXML 是 vislex 自有的纯文本 XML 文档格式，标签映射到 vislex 自身的节点：
 * - <root> / <body>：容器，透明递归；
 * - <p> / <h1>~<h6> / <blockquote> / <ul> / <ol> / <li>；
 * - <strong> / <em> / <s> / <u> / <code> / <sup> / <sub> / <br> / <a href>：行内；
 * - <codeblock lang> → 单文件代码块，<code-snippet><file name lang> → 多文件代码块；
 * - <mermaid> / <math> / <math display="block"> / <banner type> / <alert type>；
 * - <whiteboard mode src>：白板的三种存储策略，场景 / 补丁放 CDATA 体；
 * - <video src poster? title?/> / <embed src? title?/>：块级视频 / 嵌入；
 * - <table><tr><th|td>：表格，格内为行内内容，首行 <th> 为表头行；
 * - <mention id?>名字</mention> / <ruby>base<rt>rt</rt></ruby>：行内。
 *
 * 行内上下文里的块级构造降级：video/embed → src 链接、table → 丢弃、math 块级 → 行内。
 *
 * 文本统一走 rawText：XML 的 CDATA 是 CDATASection 节点，
 * 而 HTML 回退解析会把 CDATA 变成内容形如 [CDATA[...]] 的注释，两种情况都要认。
 */

// Node.nodeType：3 文本 / 4 CDATA / 8 注释
const CDATA_COMMENT = /^\s*\[CDATA\[([\s\S]*)\]\]\s*$/;

/** 透明容器：自身不产生节点，只向下递归 */
const TRANSPARENT_TAGS = new Set([
  'root',
  'body',
  'div',
  'section',
  'article',
  'main',
  'figure',
  'header',
  'footer',
  'nav',
  'aside',
  'thead',
  'tbody',
  'tr',
  'td',
  'th',
  'details',
  'summary',
]);

/** 明确不支持、导入时丢弃的标签 */
const DROPPED_TAGS = new Set(['hr', 'img', 'audio', 'iframe', 'script', 'style', 'poll']);

const BANNER_TYPE_ALIASES: Record<string, BannerType> = {
  info: 'info',
  note: 'info',
  tip: 'info',
  important: 'info',
  success: 'success',
  check: 'success',
  ok: 'success',
  warning: 'warning',
  caution: 'warning',
  attention: 'warning',
  error: 'error',
  danger: 'error',
  bug: 'error',
  failure: 'error',
};

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/** 读取节点的原始文本（含 CDATA 与 HTML 注释形式的 CDATA） */
export function rawText(node: Node): string {
  switch (node.nodeType) {
    case 3: // TEXT_NODE
    case 4: // CDATA_SECTION_NODE
      return node.nodeValue ?? '';
    case 8: {
      // COMMENT_NODE：HTML 回退解析后的 CDATA
      const match = CDATA_COMMENT.exec(node.nodeValue ?? '');
      return match ? match[1] : '';
    }
    default: {
      let out = '';
      node.childNodes.forEach((child) => {
        out += rawText(child);
      });
      return out;
    }
  }
}

/** 去掉首尾空行与紧邻标签的换行缩进，内层内容原样保留 */
function trimCode(raw: string): string {
  return raw.replace(/^\r?\n/, '').replace(/[\r\n][ \t]*$/, '');
}

function normalizeLanguage(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeBannerType(value: string | null): BannerType {
  const key = (value ?? '').trim().toLowerCase();
  return BANNER_TYPE_ALIASES[key] ?? 'info';
}

const WHITEBOARD_MODES: WhiteboardMode[] = ['inline', 'remote', 'delta'];

function normalizeWhiteboardMode(value: string | null): WhiteboardMode {
  const key = (value ?? '').trim().toLowerCase();
  return WHITEBOARD_MODES.includes(key as WhiteboardMode) ? (key as WhiteboardMode) : 'inline';
}

/**
 * <whiteboard> 三态：
 * - inline：体是完整场景 JSON；
 * - remote：src 属性指向远端快照，体为空；
 * - delta：体是差值补丁 JSON，src 属性是基础快照引用。
 */
function $buildWhiteboard(el: Element): LexicalNode {
  const body = rawText(el).trim();
  const src = (el.getAttribute('src') ?? '').trim();
  const mode = normalizeWhiteboardMode(el.getAttribute('mode'));
  if (mode === 'remote') return $createWhiteboardNode('remote', '', src, '');
  if (mode === 'delta') return $createWhiteboardNode('delta', '', src, body);
  return $createWhiteboardNode('inline', body, '', '');
}

/** 用 application/xml 解析，失败再退回 text/html（linkedom 式容错） */
export function parseLiteXML(xml: string): Document | null {
  if (typeof DOMParser === 'undefined') return null;
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'application/xml');
  if (xmlDoc.getElementsByTagName('parsererror').length === 0) return xmlDoc;
  try {
    return parser.parseFromString(xml, 'text/html');
  } catch {
    return null;
  }
}

function resolveContainer(doc: Document): Element | null {
  return doc.querySelector('root') ?? doc.querySelector('body') ?? doc.documentElement;
}

/** 粗略判定一段纯文本是否值得按 LiteXML 处理 */
export function looksLikeLiteXML(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > 500_000) return false;
  if (!/^(?:<\?xml[\s\S]*?\?>\s*)?<(?:root|body)(?:\s|>)/i.test(trimmed)) return false;
  const doc = parseLiteXML(trimmed);
  if (!doc) return false;
  return doc.getElementsByTagName('parsererror').length === 0;
}

/** 行内容器里遇到块级构造时的降级：保留内容，不破坏节点树合法性 */
function $appendInlineNode(container: ElementNode, node: Node, format: number): void {
  if (node.nodeType === 3 || node.nodeType === 4 || node.nodeType === 8) {
    const text = rawText(node);
    if (text === '') return;
    const textNode = $createTextNode(text);
    if (format !== 0) textNode.setFormat(format);
    container.append(textNode);
    return;
  }
  if (node.nodeType !== 1) return;

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    case 'br':
      container.append($createLineBreakNode());
      return;
    case 'strong':
    case 'b':
      $fillInline(container, el, format | IS_BOLD);
      return;
    case 'em':
    case 'i':
      $fillInline(container, el, format | IS_ITALIC);
      return;
    case 's':
    case 'strike':
    case 'del':
      $fillInline(container, el, format | IS_STRIKETHROUGH);
      return;
    case 'u':
      $fillInline(container, el, format | IS_UNDERLINE);
      return;
    case 'code':
      $fillInline(container, el, format | IS_CODE);
      return;
    case 'sup':
      $fillInline(container, el, format | IS_SUPERSCRIPT);
      return;
    case 'sub':
      $fillInline(container, el, format | IS_SUBSCRIPT);
      return;
    case 'math': {
      // 行内上下文里的块级公式降级为行内公式，公式本身不丢
      const equation = rawText(el);
      container.append($createInlineMathNode(equation));
      return;
    }
    case 'ruby': {
      container.append($buildRuby(el));
      return;
    }
    case 'mention': {
      const name = rawText(el).replace(/^@+/, '').trim();
      if (!name) return;
      container.append($createMentionNode(name, el.getAttribute('id')?.trim() || undefined));
      return;
    }
    case 'video':
    case 'embed': {
      // 行内上下文里的块级视频 / 嵌入降级为 src 链接，地址不丢
      const src = (el.getAttribute('src') ?? '').trim();
      if (!src) return;
      const link = $createLinkNode(src);
      link.append($createTextNode(src));
      container.append(link);
      return;
    }
    case 'a': {
      const href = el.getAttribute('href') ?? '';
      if (!href) {
        $fillInline(container, el, format);
        return;
      }
      const link = $createLinkNode(href);
      $fillInline(link, el, format);
      container.append(link);
      return;
    }
    case 'ul':
    case 'ol': {
      // 只有列表项能容纳嵌套列表，其余行内容器降级为文本
      if ($isListItemNode(container)) {
        container.append($buildList(el, tag === 'ol' ? 'number' : 'bullet'));
        return;
      }
      $fillInline(container, el, format);
      return;
    }
    default:
      // span / mark / p / codeblock 等一律透明递归，内容不丢
      $fillInline(container, el, format);
      return;
  }
}

/** 把元素的行内内容填充进容器 */
function $fillInline(container: ElementNode, el: Node, format = 0): void {
  el.childNodes.forEach((child) => {
    $appendInlineNode(container, child, format);
  });
}

function $paragraphWithInline(el: Node): LexicalNode {
  const paragraph = $createParagraphNode();
  $fillInline(paragraph, el);
  return paragraph;
}

/** 块级内容构建：返回同层节点数组 */
function $buildBlocks(parent: Node): LexicalNode[] {
  const blocks: LexicalNode[] = [];
  parent.childNodes.forEach((child) => {
    blocks.push(...$blocksFromNode(child));
  });
  return blocks;
}

function $blocksFromNode(node: Node): LexicalNode[] {
  if (node.nodeType === 1) return $blocksFromElement(node as Element);
  if (node.nodeType === 3 || node.nodeType === 4 || node.nodeType === 8) {
    const text = rawText(node);
    if (text.trim() === '') return [];
    return text
      .split(/\r?\n/)
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(line));
        return paragraph;
      });
  }
  return [];
}

function $filesFromCodeBlock(el: Element): CodeFile[] {
  return [
    {
      language: normalizeLanguage(el.getAttribute('lang') ?? el.getAttribute('language')),
      code: trimCode(rawText(el)),
    },
  ];
}

function $filesFromCodeSnippet(el: Element): CodeFile[] {
  const files: CodeFile[] = [];
  el.childNodes.forEach((child) => {
    if (child.nodeType !== 1) return;
    const file = child as Element;
    if (file.tagName.toLowerCase() !== 'file') return;
    files.push({
      name: file.getAttribute('name')?.trim() || undefined,
      language: normalizeLanguage(file.getAttribute('lang') ?? file.getAttribute('language')),
      code: trimCode(rawText(file)),
    });
  });
  return files;
}

function $mermaidCode(el: Element): string {
  const text = trimCode(rawText(el));
  return text || (el.getAttribute('code') ?? '');
}

function $buildBanner(el: Element): LexicalNode {
  const banner = $createBannerNode(normalizeBannerType(el.getAttribute('type')));
  const blocks = $buildBlocks(el);
  if (blocks.length === 0) {
    banner.append($createParagraphNode());
  } else {
    for (const block of blocks) banner.append(block);
  }
  return banner;
}

function $buildGallery(el: Element): LexicalNode {
  const images: GalleryImage[] = [];
  el.childNodes.forEach((child) => {
    if (child.nodeType !== 1) return;
    const img = child as Element;
    if (img.tagName.toLowerCase() !== 'img') return;
    const src = (img.getAttribute('src') ?? '').trim();
    if (!src) return;
    images.push({
      src,
      alt: img.getAttribute('alt')?.trim() || undefined,
      caption: img.getAttribute('caption')?.trim() || undefined,
    });
  });
  return $createGalleryNode(normalizeGalleryLayout(el.getAttribute('layout')), images);
}

/** 解析 <ruby>base<rt>rt</rt></ruby>：rt 取首个 <rt> 子元素，base 为其余内容文本 */
function $buildRuby(el: Element): LexicalNode {
  let rt = '';
  const baseParts: string[] = [];
  el.childNodes.forEach((child) => {
    if (child.nodeType === 1 && (child as Element).tagName.toLowerCase() === 'rt') {
      rt = rawText(child);
      return;
    }
    baseParts.push(rawText(child));
  });
  return $createRubyNode(baseParts.join(''), rt);
}

/** 解析 <table>：收集 <tr>（允许 thead/tbody 包裹），首行 <th> 为表头行 */
function $buildTable(el: Element): LexicalNode[] {
  const rows: Element[] = [];
  const collect = (container: Element): void => {
    container.childNodes.forEach((child) => {
      if (child.nodeType !== 1) return;
      const childEl = child as Element;
      const childTag = childEl.tagName.toLowerCase();
      if (childTag === 'tr') rows.push(childEl);
      else if (childTag === 'thead' || childTag === 'tbody' || childTag === 'tfoot') collect(childEl);
    });
  };
  collect(el);
  if (rows.length === 0) {
    // 无 <tr> 的表格按透明容器处理，内容不丢
    return $buildBlocks(el);
  }
  const table = $createTableNode();
  rows.forEach((row, rowIndex) => {
    const rowNode = $createTableRowNode();
    row.childNodes.forEach((cell) => {
      if (cell.nodeType !== 1) return;
      const cellEl = cell as Element;
      const cellTag = cellEl.tagName.toLowerCase();
      if (cellTag !== 'td' && cellTag !== 'th') return;
      const headerState =
        rowIndex === 0 && cellTag === 'th'
          ? TableCellHeaderStates.ROW
          : TableCellHeaderStates.NO_STATUS;
      const cellNode = $createTableCellNode(headerState);
      const paragraph = $createParagraphNode();
      $fillInline(paragraph, cellEl);
      cellNode.append(paragraph);
      rowNode.append(cellNode);
    });
    table.append(rowNode);
  });
  return [table];
}

function $buildList(el: Element, type: 'bullet' | 'number'): LexicalNode {
  const list = $createListNode(type);
  const items: Element[] = [];
  el.childNodes.forEach((child) => {
    if (child.nodeType === 1 && (child as Element).tagName.toLowerCase() === 'li') {
      items.push(child as Element);
    }
  });
  // 没有显式 <li> 时把容器自身当作唯一一项
  if (items.length === 0) items.push(el);

  for (const item of items) {
    const listItem = $createListItemNode();
    $fillInline(listItem, item);
    list.append(listItem);
  }
  return list;
}

function $blocksFromElement(el: Element): LexicalNode[] {
  const tag = el.tagName.toLowerCase();

  if (TRANSPARENT_TAGS.has(tag)) return $buildBlocks(el);
  if (HEADING_TAGS.has(tag)) {
    const heading = $createHeadingNode(tag as HeadingTagType);
    $fillInline(heading, el);
    return [heading];
  }

  switch (tag) {
    case 'p':
      return [$paragraphWithInline(el)];
    case 'blockquote': {
      const quote = $createQuoteNode();
      $fillInline(quote, el);
      return [quote];
    }
    case 'ul':
      return [$buildList(el, 'bullet')];
    case 'ol':
      return [$buildList(el, 'number')];
    case 'li':
      return [$paragraphWithInline(el)];
    case 'codeblock':
      return [$createCodeBlockNode($filesFromCodeBlock(el))];
    case 'code-snippet': {
      const files = $filesFromCodeSnippet(el);
      return [$createCodeBlockNode(files.length > 0 ? files : [{ code: '' }])];
    }
    case 'mermaid':
      return [$createMermaidNode($mermaidCode(el))];
    case 'math': {
      const equation = rawText(el);
      const display = (el.getAttribute('display') ?? '').trim().toLowerCase();
      if (display === 'block') return [$createBlockMathNode(equation)];
      const paragraph = $createParagraphNode();
      paragraph.append($createInlineMathNode(equation));
      return [paragraph];
    }
    case 'banner':
    case 'alert':
      return [$buildBanner(el)];
    case 'whiteboard':
      return [$buildWhiteboard(el)];
    case 'gallery':
      return [$buildGallery(el)];
    case 'video': {
      const src = (el.getAttribute('src') ?? '').trim();
      if (!src) return [];
      const video = $createVideoNode(src);
      video.setPoster(el.getAttribute('poster')?.trim() || undefined);
      video.setTitle(el.getAttribute('title')?.trim() || undefined);
      return [video];
    }
    case 'embed': {
      const src = (el.getAttribute('src') ?? '').trim();
      if (!src) return [];
      const embed = $createEmbedNode(src);
      embed.setTitle(el.getAttribute('title')?.trim() || undefined);
      return [embed];
    }
    case 'ruby': {
      const paragraph = $createParagraphNode();
      paragraph.append($buildRuby(el));
      return [paragraph];
    }
    case 'mention': {
      const name = rawText(el).replace(/^@+/, '').trim();
      if (!name) return [];
      const paragraph = $createParagraphNode();
      paragraph.append($createMentionNode(name, el.getAttribute('id')?.trim() || undefined));
      return [paragraph];
    }
    case 'table':
      return $buildTable(el);
    default:
      if (DROPPED_TAGS.has(tag)) return [];
      // 未知标签按透明容器处理，内容不丢
      return $buildBlocks(el);
  }
}

/** 在 update 上下文中把 LiteXML 插入当前选区 */
export function $insertLiteXML(xml: string): boolean {
  const doc = parseLiteXML(xml);
  if (!doc) return false;
  const container = resolveContainer(doc);
  if (!container) return false;

  const blocks = $buildBlocks(container);
  if (blocks.length === 0) return false;

  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    selection.insertNodes(blocks);
    return true;
  }

  const root = $getRoot();
  for (const block of blocks) root.append(block);
  const last = blocks[blocks.length - 1];
  if ($isElementNode(last)) last.selectEnd();
  return true;
}

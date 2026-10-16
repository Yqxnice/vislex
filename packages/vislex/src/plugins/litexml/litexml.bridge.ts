/**
 * LiteXML 纯 JSON↔XML 双向桥。
 *
 * 无编辑器实例、无 React、无 DOM 依赖（自带 mini XML 解析器），浏览器与 Node 通用。
 * 本文件是 LiteXML 词汇表的唯一权威规格：编辑器端的实例级导入导出
 * （serialize.ts / deserialize.ts）与服务端 headless 副本都以这里为准。
 * apps/core 侧存在本文件的逐字副本（apps/core/src/posts/lexical/litexml.bridge.ts），
 * 格式变更必须两端同步。
 *
 * == 词汇表 ==
 * - 根容器：<root>（导入也接受 <body>，以及任意透明容器）
 * - 透明容器（导入时只递归不产出节点）：
 *   root/body/div/section/article/main/figure/header/footer/nav/aside/thead/tbody/tr/td/th/details/summary
 * - 丢弃标签（导入时忽略）：hr/audio/iframe/script/style/poll（img 仅在 <gallery> 内合法）
 * - 块级：<p>、<h1>~<h6>、<blockquote>、<ul>/<ol>（子项 <li>）、
 *   <banner type="info|success|warning|error">（别名见下，内部可含块级）、
 *   <codeblock lang>（单文件代码块）、<code-snippet>（子项 <file name lang>，多文件）、
 *   <mermaid>、<math display="block">（块级公式）、<gallery layout="grid|masonry|carousel">（子项 <img src alt caption/>）、
 *   <whiteboard mode="inline|remote|delta" src>、
 *   <video src poster? title?/>、<embed src? title?/>、
 *   <table>（子项 <tr>，单元格 <th>/<td>，格内为行内内容）
 * - 行内：<strong>(b)、<em>(i)、<s>(strike/del)、<u>、<code>、<sup>、<sub>、<br/>、<a href>、<math>（无 display 属性 = 行内公式）、
 *   <mention id?>名字</mention>（名字不带 @，导入自动补）、<ruby>base<rt>rt</rt></ruby>
 * - <whiteboard> 三态：inline 体 = 完整场景 JSON；remote 体为空、src = 快照 URL；delta 体 = RFC6902 补丁 JSON、src = 基线快照引用
 * - 代码 / 公式 / 图表 / 白板体统一 CDATA 包裹；正文文本 escape & < >，属性额外 escape 双引号
 * - banner type 别名：note/tip/important→info，check/ok→success，caution/attention→warning，danger/bug/failure→error
 * - 行内上下文里的块级构造降级：video/embed → src 链接、table → 丢弃、math 块级 → 行内
 *
 * == 节点 JSON 形状（type → 数据字段）==
 * code-block{files:[{name?,language?,code}]} / mermaid{code} /
 * math-inline{equation} / math-block{equation} / banner{variant,children} /
 * whiteboard{mode,scene,src,patch} / gallery{layout,images:[{src,alt?,caption?}]} /
 * video{src,poster?,title?} / embed{src,title?} / mention{text(以@开头),mentionId?} /
 * ruby{base,rt} / table（@lexical/table 原生形状：table→tablerow→tablecell，headerState 1=表头行）
 * LinkCard 不在词汇表内，导出降级为文本段落。
 */

import {
  IS_BOLD,
  IS_CODE,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_SUBSCRIPT,
  IS_SUPERSCRIPT,
  IS_UNDERLINE,
  type SerializedEditorState,
} from 'lexical';

type JsonRecord = Record<string, unknown>;

// ===== mini XML 解析器（自包含，替代 DOMParser）=====

interface XText {
  kind: 'text';
  text: string;
}

interface XElement {
  kind: 'el';
  tag: string;
  attrs: Record<string, string>;
  children: XNode[];
}

type XNode = XText | XElement;

/** 不需要闭合标签的空元素 */
const VOID_TAGS = new Set(['br', 'img', 'hr', 'area', 'base', 'col', 'embed', 'input', 'link', 'meta', 'param', 'source', 'track', 'video', 'wbr']);

function safeFromCodePoint(n: number): string {
  if (!Number.isFinite(n) || n < 0 || n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) return '\uFFFD';
  return String.fromCodePoint(n);
}

/** 解码实体；未识别的 & 序列原样保留（比严格 XML 更宽容，适合 LLM 产出） */
function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => safeFromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => safeFromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** 找开始标签的 '>'，跳过属性引号内的 '>'；找不到返回 -1 */
function findTagEnd(xml: string, start: number): number {
  let quote: string | null = null;
  for (let j = start + 1; j < xml.length; j++) {
    const ch = xml[j];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '>') {
      return j;
    }
  }
  return -1;
}

const ATTR_RE = /([a-zA-Z_][a-zA-Z0-9:_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

function parseOpenTag(body: string): { tag: string; attrs: Record<string, string> } {
  const nameMatch = /^([a-zA-Z][a-zA-Z0-9:_-]*)/.exec(body);
  if (!nameMatch) return { tag: '', attrs: {} };
  const attrs: Record<string, string> = {};
  ATTR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR_RE.exec(body))) {
    attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? '');
  }
  return { tag: nameMatch[1].toLowerCase(), attrs };
}

/**
 * 解析 XML 文档为节点树。容错策略：未闭合标签在遇到匹配闭合或 EOF 时自动闭合，
 * 孤立闭合标签忽略，无法识别的 '<' 片段按字面文本保留。解析不抛错。
 */
function parseXmlTree(xml: string): XElement {
  const doc: XElement = { kind: 'el', tag: '#doc', attrs: {}, children: [] };
  const stack: XElement[] = [doc];
  const top = (): XElement => stack[stack.length - 1];
  const pushText = (raw: string, isCdata = false): void => {
    if (raw === '') return;
    top().children.push({ kind: 'text', text: isCdata ? raw : decodeEntities(raw) });
  };

  let i = 0;
  const n = xml.length;
  while (i < n) {
    const lt = xml.indexOf('<', i);
    if (lt === -1) {
      pushText(xml.slice(i));
      break;
    }
    if (lt > i) pushText(xml.slice(i, lt));

    if (xml.startsWith('<![CDATA[', lt)) {
      const end = xml.indexOf(']]>', lt + 9);
      const content = end === -1 ? xml.slice(lt + 9) : xml.slice(lt + 9, end);
      pushText(content, true);
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (xml.startsWith('<!--', lt)) {
      const end = xml.indexOf('-->', lt + 4);
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (xml.startsWith('<?', lt) || xml.startsWith('<!', lt)) {
      // XML 声明 / DOCTYPE / 处理指令：跳过
      const end = xml.indexOf('>', lt);
      i = end === -1 ? n : end + 1;
      continue;
    }
    if (xml.startsWith('</', lt)) {
      const gt = xml.indexOf('>', lt);
      if (gt === -1) {
        i = n;
        continue;
      }
      const tag = xml.slice(lt + 2, gt).trim().toLowerCase();
      // 就近弹出匹配的开始标签，其间未闭合的后代自动闭合；孤立闭合忽略
      for (let s = stack.length - 1; s > 0; s--) {
        if (stack[s].tag === tag) {
          stack.length = s;
          break;
        }
      }
      i = gt + 1;
      continue;
    }

    const gt = findTagEnd(xml, lt);
    if (gt === -1) {
      pushText(xml.slice(lt));
      break;
    }
    const inner = xml.slice(lt + 1, gt);
    let body = inner.trim();
    let selfClosing = false;
    if (body.endsWith('/')) {
      selfClosing = true;
      body = body.slice(0, -1).trimEnd();
    }
    const { tag, attrs } = parseOpenTag(body);
    if (tag === '') {
      // 无法识别的标签片段按字面文本保留
      pushText(xml.slice(lt, gt + 1));
      i = gt + 1;
      continue;
    }
    const el: XElement = { kind: 'el', tag, attrs, children: [] };
    top().children.push(el);
    if (!selfClosing && !VOID_TAGS.has(tag)) stack.push(el);
    i = gt + 1;
  }
  return doc;
}

/** 深度优先找第一个指定标签的元素 */
function findElement(root: XElement, tag: string): XElement | null {
  if (root.tag === tag) return root;
  for (const child of root.children) {
    if (child.kind === 'el') {
      const found = findElement(child, tag);
      if (found) return found;
    }
  }
  return null;
}

// ===== 通用文本工具（与 serialize.ts / deserialize.ts 语义一致）=====

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(value: string): string {
  return escapeText(value).replace(/"/g, '&quot;');
}

/** CDATA 包裹；内容含 ]]> 时按 XML 规则拆分 */
function cdata(raw: string): string {
  if (raw === '') return '<![CDATA[]]>';
  return `<![CDATA[${raw.split(']]>').join(']]]]><![CDATA[>')}]]>`;
}

/** 拼接元素（或文本节点）内所有原始文本，CDATA 原样、正文已解码 */
function rawXText(node: XNode): string {
  if (node.kind === 'text') return node.text;
  return node.children.map(rawXText).join('');
}

/** 去掉首尾空行与紧邻标签的换行缩进，内层内容原样保留 */
function trimCode(raw: string): string {
  return raw.replace(/^\r?\n/, '').replace(/[\r\n][ \t]*$/, '');
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function childrenOf(node: JsonRecord): JsonRecord[] {
  return Array.isArray(node.children) ? node.children.filter(isRecord) : [];
}

// ===== JSON → XML =====

const BANNER_TYPES = new Set(['info', 'success', 'warning', 'error']);
const WHITEBOARD_MODES = new Set(['inline', 'remote', 'delta']);
const GALLERY_LAYOUTS = new Set(['grid', 'masonry', 'carousel']);
const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/** format 位 → 行内标签包裹顺序：code 最内层，sub 最外层（与旧实例序列化逐字节一致） */
function wrapFormat(text: string, format: number): string {
  let out = text;
  if (format & IS_CODE) out = `<code>${out}</code>`;
  if (format & IS_BOLD) out = `<strong>${out}</strong>`;
  if (format & IS_ITALIC) out = `<em>${out}</em>`;
  if (format & IS_STRIKETHROUGH) out = `<s>${out}</s>`;
  if (format & IS_UNDERLINE) out = `<u>${out}</u>`;
  if (format & IS_SUPERSCRIPT) out = `<sup>${out}</sup>`;
  if (format & IS_SUBSCRIPT) out = `<sub>${out}</sub>`;
  return out;
}

function jsonInlineNode(node: JsonRecord): string {
  switch (node.type) {
    case 'text': {
      const text = str(node.text);
      const format = typeof node.format === 'number' ? node.format : 0;
      return wrapFormat(escapeText(text), format);
    }
    case 'linebreak':
      return '<br/>';
    case 'link': {
      const url = str(node.url);
      return `<a href="${escapeAttr(url)}">${jsonInlineChildren(node)}</a>`;
    }
    case 'math-inline':
      return `<math>${cdata(str(node.equation))}</math>`;
    case 'mention': {
      const name = str(node.text).replace(/^@/, '');
      const id = str(node.mentionId);
      const attr = id ? ` id="${escapeAttr(id)}"` : '';
      return `<mention${attr}>${escapeText(name)}</mention>`;
    }
    case 'ruby':
      return `<ruby>${escapeText(str(node.base))}<rt>${escapeText(str(node.rt))}</rt></ruby>`;
    default: {
      // 其他行内元素透明展开；无 children 的装饰节点降级为纯文本
      if (Array.isArray(node.children)) return jsonInlineChildren(node);
      return escapeText(jsonTextContent(node));
    }
  }
}

function jsonInlineChildren(node: JsonRecord): string {
  return childrenOf(node)
    .map(jsonInlineNode)
    .join('');
}

/** 递归收集节点树内所有文本（用于未知装饰节点的降级输出） */
function jsonTextContent(node: JsonRecord): string {
  const text = str(node.text);
  const children = Array.isArray(node.children) ? node.children.filter(isRecord) : [];
  return text + children.map(jsonTextContent).join('');
}

function jsonCodeBlockToXml(node: JsonRecord): string {
  const rawFiles = Array.isArray(node.files) ? node.files.filter(isRecord) : [];
  const files = rawFiles.map((file) => ({
    name: str(file.name) || undefined,
    language: str(file.language) || undefined,
    code: str(file.code),
  }));
  if (files.length <= 1) {
    const file = files[0];
    if (!file) return '<codeblock></codeblock>';
    const lang = file.language ? ` lang="${escapeAttr(file.language)}"` : '';
    return `<codeblock${lang}>${cdata(file.code)}</codeblock>`;
  }
  const inner = files
    .map((file) => {
      const name = file.name ? ` name="${escapeAttr(file.name)}"` : '';
      const lang = file.language ? ` lang="${escapeAttr(file.language)}"` : '';
      return `<file${name}${lang}>${cdata(file.code)}</file>`;
    })
    .join('');
  return `<code-snippet>${inner}</code-snippet>`;
}

function jsonWhiteboardToXml(node: JsonRecord): string {
  const mode = WHITEBOARD_MODES.has(str(node.mode)) ? str(node.mode) : 'inline';
  const src = str(node.src);
  if (mode === 'remote') return `<whiteboard mode="remote" src="${escapeAttr(src)}"></whiteboard>`;
  if (mode === 'delta') {
    return `<whiteboard mode="delta" src="${escapeAttr(src)}">${cdata(str(node.patch))}</whiteboard>`;
  }
  return `<whiteboard mode="inline">${cdata(str(node.scene))}</whiteboard>`;
}

function jsonGalleryToXml(node: JsonRecord): string {
  const layout = GALLERY_LAYOUTS.has(str(node.layout)) ? str(node.layout) : 'grid';
  const rawImages = Array.isArray(node.images) ? node.images.filter(isRecord) : [];
  const inner = rawImages
    .filter((image) => str(image.src) !== '')
    .map((image) => {
      const attrs = [`src="${escapeAttr(str(image.src))}"`];
      if (str(image.alt)) attrs.push(`alt="${escapeAttr(str(image.alt))}"`);
      if (str(image.caption)) attrs.push(`caption="${escapeAttr(str(image.caption))}"`);
      return `<img ${attrs.join(' ')}/>`;
    })
    .join('');
  return `<gallery layout="${layout}">${inner}</gallery>`;
}

function jsonVideoToXml(node: JsonRecord): string {
  const attrs = [`src="${escapeAttr(str(node.src))}"`];
  if (str(node.poster)) attrs.push(`poster="${escapeAttr(str(node.poster))}"`);
  if (str(node.title)) attrs.push(`title="${escapeAttr(str(node.title))}"`);
  return `<video ${attrs.join(' ')}/>`;
}

function jsonEmbedToXml(node: JsonRecord): string {
  const attrs = [`src="${escapeAttr(str(node.src))}"`];
  if (str(node.title)) attrs.push(`title="${escapeAttr(str(node.title))}"`);
  return `<embed ${attrs.join(' ')}/>`;
}

function jsonTableToXml(node: JsonRecord): string {
  const rows = childrenOf(node).filter((row) => row.type === 'tablerow');
  const inner = rows
    .map((row, rowIndex) => {
      const cells = childrenOf(row).filter((cell) => cell.type === 'tablecell');
      const cellsXml = cells
        .map((cell) => {
          // 单元格内多个段落以 <br/> 连接（LiteXML 单元格为行内内容）
          const content = childrenOf(cell).map(jsonInlineChildren).join('<br/>');
          const tag = rowIndex === 0 ? 'th' : 'td';
          return `<${tag}>${content}</${tag}>`;
        })
        .join('');
      return `<tr>${cellsXml}</tr>`;
    })
    .join('');
  return `<table>${inner}</table>`;
}

function jsonBlockToXml(node: JsonRecord): string {
  switch (node.type) {
    case 'paragraph':
      return `<p>${jsonInlineChildren(node)}</p>`;
    case 'heading': {
      const tag = str(node.tag);
      if (HEADING_TAGS.has(tag)) {
        return `<${tag}>${jsonInlineChildren(node)}</${tag}>`;
      }
      return `<p>${jsonInlineChildren(node)}</p>`;
    }
    case 'quote':
      return `<blockquote>${jsonInlineChildren(node)}</blockquote>`;
    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul';
      const items = childrenOf(node).filter((child) => child.type === 'listitem');
      return `<${tag}>${items.map(jsonListItemToXml).join('')}</${tag}>`;
    }
    case 'code-block':
      return jsonCodeBlockToXml(node);
    case 'mermaid':
      return `<mermaid>${cdata(str(node.code))}</mermaid>`;
    case 'math-block':
      return `<math display="block">${cdata(str(node.equation))}</math>`;
    case 'banner': {
      const variant = BANNER_TYPES.has(str(node.variant)) ? str(node.variant) : 'info';
      return `<banner type="${variant}">${childrenOf(node).map(jsonBlockToXml).join('')}</banner>`;
    }
    case 'whiteboard':
      return jsonWhiteboardToXml(node);
    case 'gallery':
      return jsonGalleryToXml(node);
    case 'video':
      return jsonVideoToXml(node);
    case 'embed':
      return jsonEmbedToXml(node);
    case 'table':
      return jsonTableToXml(node);
    case 'link-card':
      // 不在词汇表内，降级为 URL 纯文本段落（与 LinkCardNode.getTextContent 兜底一致）
      return `<p>${escapeText(str(node.url))}</p>`;
    default: {
      // 未知块级元素 / 装饰节点降级为纯文本段落
      if (Array.isArray(node.children)) return `<p>${jsonInlineChildren(node)}</p>`;
      return `<p>${escapeText(jsonTextContent(node))}</p>`;
    }
  }
}

function jsonListItemToXml(node: JsonRecord): string {
  const parts = childrenOf(node).map((child) =>
    child.type === 'list' ? jsonBlockToXml(child) : jsonInlineNode(child),
  );
  return `<li>${parts.join('')}</li>`;
}

/**
 * 把 Lexical EditorState JSON 对象序列化成 LiteXML 字符串。
 * 只输出词汇表内的节点；未知节点（含装饰类）降级为纯文本段落，输出始终合法。
 */
export function jsonToLiteXML(state: unknown): string {
  const root = isRecord(state) ? state.root : undefined;
  if (!isRecord(root)) return '<root></root>';
  const children = Array.isArray(root.children) ? root.children.filter(isRecord) : [];
  return `<root>${children.map(jsonBlockToXml).join('')}</root>`;
}

// ===== XML → JSON =====

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

const DROPPED_TAGS = new Set(['hr', 'img', 'audio', 'iframe', 'script', 'style', 'poll']);

const BANNER_TYPE_ALIASES: Record<string, string> = {
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

function normalizeBannerType(value: unknown): string {
  const key = str(value).trim().toLowerCase();
  return BANNER_TYPE_ALIASES[key] ?? 'info';
}

function normalizeLanguage(value: unknown): string | undefined {
  const trimmed = str(value).trim();
  return trimmed || undefined;
}

function normalizeWhiteboardMode(value: unknown): 'inline' | 'remote' | 'delta' {
  const key = str(value).trim().toLowerCase();
  return key === 'remote' || key === 'delta' ? key : 'inline';
}

function normalizeGalleryLayout(value: unknown): string {
  const key = str(value).trim().toLowerCase();
  return GALLERY_LAYOUTS.has(key) ? key : 'grid';
}

// —— JSON 节点构造（最小合法 EditorState JSON，可被 parseEditorState 直接消费）——

function textJson(text: string, format = 0): JsonRecord {
  return { detail: 0, format, mode: 'normal', style: '', text, type: 'text', version: 1 };
}

function linebreakJson(): JsonRecord {
  return { type: 'linebreak', version: 1 };
}

function linkJson(url: string, children: JsonRecord[]): JsonRecord {
  return { children, rel: null, target: null, title: null, type: 'link', url, version: 1 };
}

function paragraphJson(children: JsonRecord[]): JsonRecord {
  return { children, type: 'paragraph', version: 1 };
}

function headingJson(tag: string, children: JsonRecord[]): JsonRecord {
  return { children, tag, type: 'heading', version: 1 };
}

function quoteJson(children: JsonRecord[]): JsonRecord {
  return { children, type: 'quote', version: 1 };
}

function mathInlineJson(equation: string): JsonRecord {
  return { equation, type: 'math-inline', version: 1 };
}

function mathBlockJson(equation: string): JsonRecord {
  return { equation, type: 'math-block', version: 1 };
}

function codeBlockJson(files: Array<{ name?: string; language?: string; code: string }>): JsonRecord {
  return { files, type: 'code-block', version: 1 };
}

function mermaidJson(code: string): JsonRecord {
  return { code, type: 'mermaid', version: 1 };
}

function bannerJson(variant: string, children: JsonRecord[]): JsonRecord {
  return { children, type: 'banner', variant, version: 1 };
}

function whiteboardJson(
  mode: 'inline' | 'remote' | 'delta',
  scene: string,
  src: string,
  patch: string,
): JsonRecord {
  return { mode, patch, scene, src, type: 'whiteboard', version: 1 };
}

function galleryJson(layout: string, images: Array<{ src: string; alt?: string; caption?: string }>): JsonRecord {
  return { images, layout, type: 'gallery', version: 1 };
}

function videoJson(src: string, poster?: string, title?: string): JsonRecord {
  const node: JsonRecord = { src, type: 'video', version: 1 };
  if (poster) node.poster = poster;
  if (title) node.title = title;
  return node;
}

function embedJson(src: string, title?: string): JsonRecord {
  const node: JsonRecord = { src, type: 'embed', version: 1 };
  if (title) node.title = title;
  return node;
}

/** mention 是 TextNode 子类：JSON 含完整文本节点形状，text 以 @ 开头 */
function mentionJson(name: string, mentionId?: string): JsonRecord {
  const node: JsonRecord = {
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text: `@${name}`,
    type: 'mention',
    version: 1,
  };
  if (mentionId) node.mentionId = mentionId;
  return node;
}

function rubyJson(base: string, rt: string): JsonRecord {
  return { base, rt, type: 'ruby', version: 1 };
}

function tableCellJson(children: JsonRecord[], headerState: number): JsonRecord {
  return { children, colSpan: 1, headerState, rowSpan: 1, type: 'tablecell', version: 1 };
}

function tableRowJson(cells: JsonRecord[]): JsonRecord {
  return { children: cells, type: 'tablerow', version: 1 };
}

function tableJson(rows: JsonRecord[]): JsonRecord {
  return { children: rows, type: 'table', version: 1 };
}

function listJson(type: 'bullet' | 'number', items: JsonRecord[]): JsonRecord {
  return {
    children: items,
    listType: type,
    start: 1,
    tag: type === 'number' ? 'ol' : 'ul',
    type: 'list',
    version: 1,
  };
}

// —— 行内构建：与 deserialize.ts 的 $appendInlineNode 语义一致 ——

/** 行内上下文里遇到列表时，只有列表项容器能容纳嵌套列表 */
function inlineNodes(node: XNode, format: number, allowList: boolean): JsonRecord[] {
  if (node.kind === 'text') {
    return node.text === '' ? [] : [textJson(node.text, format)];
  }

  switch (node.tag) {
    case 'br':
      return [linebreakJson()];
    case 'strong':
    case 'b':
      return inlineChildrenOf(node, format | IS_BOLD, allowList);
    case 'em':
    case 'i':
      return inlineChildrenOf(node, format | IS_ITALIC, allowList);
    case 's':
    case 'strike':
    case 'del':
      return inlineChildrenOf(node, format | IS_STRIKETHROUGH, allowList);
    case 'u':
      return inlineChildrenOf(node, format | IS_UNDERLINE, allowList);
    case 'code':
      return inlineChildrenOf(node, format | IS_CODE, allowList);
    case 'sup':
      return inlineChildrenOf(node, format | IS_SUPERSCRIPT, allowList);
    case 'sub':
      return inlineChildrenOf(node, format | IS_SUBSCRIPT, allowList);
    case 'math': {
      // 行内上下文里的块级公式降级为行内公式，公式本身不丢
      return [mathInlineJson(rawXText(node))];
    }
    case 'ruby':
      return [xmlRubyJson(node)];
    case 'mention': {
      const name = rawXText(node).replace(/^@+/, '').trim();
      if (!name) return [];
      return [mentionJson(name, node.attrs.id?.trim() || undefined)];
    }
    case 'video':
    case 'embed': {
      // 行内上下文里的块级视频 / 嵌入降级为 src 链接，地址不丢
      const src = (node.attrs.src ?? '').trim();
      if (!src) return [];
      return [linkJson(src, [textJson(src)])];
    }
    case 'a': {
      const href = node.attrs.href ?? '';
      if (!href) return inlineChildrenOf(node, format, allowList);
      return [linkJson(href, inlineChildrenOf(node, format, allowList))];
    }
    case 'ul':
    case 'ol': {
      if (allowList) return [listJson(node.tag === 'ol' ? 'number' : 'bullet', listItemsOf(node))];
      return inlineChildrenOf(node, format, allowList);
    }
    default:
      // span / mark / p / codeblock 等一律透明递归，内容不丢
      return inlineChildrenOf(node, format, allowList);
  }
}

function inlineChildrenOf(el: XElement, format: number, allowList: boolean): JsonRecord[] {
  return el.children.flatMap((child) => inlineNodes(child, format, allowList));
}

function listItemsOf(el: XElement): JsonRecord[] {
  const items = el.children.filter(
    (child): child is XElement => child.kind === 'el' && child.tag === 'li',
  );
  // 没有显式 <li> 时把容器自身当作唯一一项
  const sources = items.length > 0 ? items : [el];
  return sources.map((item) => ({
    children: inlineChildrenOf(item, 0, true),
    type: 'listitem',
    version: 1,
  }));
}

// —— 块级构建：与 deserialize.ts 的 $blocksFromElement 语义一致 ——

function blocksFromInline(el: XElement): JsonRecord[] {
  return [paragraphJson(inlineChildrenOf(el, 0, false))];
}

function xmlCodeBlockFiles(el: XElement): Array<{ name?: string; language?: string; code: string }> {
  return [
    {
      language: normalizeLanguage(el.attrs.lang ?? el.attrs.language),
      code: trimCode(rawXText(el)),
    },
  ];
}

function xmlCodeSnippetFiles(el: XElement): Array<{ name?: string; language?: string; code: string }> {
  const files: Array<{ name?: string; language?: string; code: string }> = [];
  for (const child of el.children) {
    if (child.kind !== 'el' || child.tag !== 'file') continue;
    files.push({
      name: child.attrs.name?.trim() || undefined,
      language: normalizeLanguage(child.attrs.lang ?? child.attrs.language),
      code: trimCode(rawXText(child)),
    });
  }
  return files;
}

function xmlWhiteboard(el: XElement): JsonRecord {
  const body = rawXText(el).trim();
  const src = (el.attrs.src ?? '').trim();
  const mode = normalizeWhiteboardMode(el.attrs.mode);
  if (mode === 'remote') return whiteboardJson('remote', '', src, '');
  if (mode === 'delta') return whiteboardJson('delta', '', src, body);
  return whiteboardJson('inline', body, '', '');
}

function xmlGallery(el: XElement): JsonRecord {
  const images: Array<{ src: string; alt?: string; caption?: string }> = [];
  for (const child of el.children) {
    if (child.kind !== 'el' || child.tag !== 'img') continue;
    const src = (child.attrs.src ?? '').trim();
    if (!src) continue;
    images.push({
      src,
      alt: child.attrs.alt?.trim() || undefined,
      caption: child.attrs.caption?.trim() || undefined,
    });
  }
  return galleryJson(normalizeGalleryLayout(el.attrs.layout), images);
}

function xmlBanner(el: XElement): JsonRecord {
  const blocks = xmlBlocks(el);
  return bannerJson(normalizeBannerType(el.attrs.type), blocks.length > 0 ? blocks : [paragraphJson([])]);
}

/** 解析 <ruby>base<rt>rt</rt></ruby>：rt 取首个 <rt> 子元素，base 为其余内容文本 */
function xmlRubyJson(el: XElement): JsonRecord {
  let rt = '';
  const baseParts: string[] = [];
  for (const child of el.children) {
    if (child.kind === 'el' && child.tag === 'rt') {
      rt = rawXText(child);
      continue;
    }
    baseParts.push(rawXText(child));
  }
  return rubyJson(baseParts.join(''), rt);
}

/** 解析 <table>：收集 <tr>（允许 thead/tbody 包裹），首行 <th> 为表头行 */
function xmlTable(el: XElement): JsonRecord[] {
  const rows: XElement[] = [];
  const collect = (container: XElement): void => {
    for (const child of container.children) {
      if (child.kind !== 'el') continue;
      if (child.tag === 'tr') rows.push(child);
      else if (child.tag === 'thead' || child.tag === 'tbody' || child.tag === 'tfoot') collect(child);
    }
  };
  collect(el);
  if (rows.length === 0) {
    // 无 <tr> 的表格按透明容器处理，内容不丢
    return xmlBlocks(el);
  }
  const tableRows = rows.map((row, rowIndex) => {
    const cells: JsonRecord[] = [];
    for (const child of row.children) {
      if (child.kind !== 'el' || (child.tag !== 'td' && child.tag !== 'th')) continue;
      const headerState = rowIndex === 0 && child.tag === 'th' ? 1 : 0;
      cells.push(tableCellJson([paragraphJson(inlineChildrenOf(child, 0, false))], headerState));
    }
    return tableRowJson(cells);
  });
  return [tableJson(tableRows)];
}

function xmlBlocksFromElement(el: XElement): JsonRecord[] {
  const tag = el.tag;

  if (TRANSPARENT_TAGS.has(tag)) return xmlBlocks(el);
  if (HEADING_TAGS.has(tag)) return [headingJson(tag, inlineChildrenOf(el, 0, false))];

  switch (tag) {
    case 'p':
    case 'li':
      return blocksFromInline(el);
    case 'blockquote':
      return [quoteJson(inlineChildrenOf(el, 0, false))];
    case 'ul':
      return [listJson('bullet', listItemsOf(el))];
    case 'ol':
      return [listJson('number', listItemsOf(el))];
    case 'codeblock':
      return [codeBlockJson(xmlCodeBlockFiles(el))];
    case 'code-snippet': {
      const files = xmlCodeSnippetFiles(el);
      return [codeBlockJson(files.length > 0 ? files : [{ code: '' }])];
    }
    case 'mermaid': {
      const text = trimCode(rawXText(el));
      return [mermaidJson(text || (el.attrs.code ?? ''))];
    }
    case 'math': {
      const equation = rawXText(el);
      const display = (el.attrs.display ?? '').trim().toLowerCase();
      if (display === 'block') return [mathBlockJson(equation)];
      return [paragraphJson([mathInlineJson(equation)])];
    }
    case 'banner':
    case 'alert':
      return [xmlBanner(el)];
    case 'whiteboard':
      return [xmlWhiteboard(el)];
    case 'gallery':
      return [xmlGallery(el)];
    case 'video': {
      const src = (el.attrs.src ?? '').trim();
      return src
        ? [videoJson(src, el.attrs.poster?.trim() || undefined, el.attrs.title?.trim() || undefined)]
        : [];
    }
    case 'embed': {
      const src = (el.attrs.src ?? '').trim();
      return src ? [embedJson(src, el.attrs.title?.trim() || undefined)] : [];
    }
    case 'ruby':
      return [paragraphJson([xmlRubyJson(el)])];
    case 'mention': {
      const name = rawXText(el).replace(/^@+/, '').trim();
      if (!name) return [];
      return [paragraphJson([mentionJson(name, el.attrs.id?.trim() || undefined)])];
    }
    case 'table':
      return xmlTable(el);
    default:
      if (DROPPED_TAGS.has(tag)) return [];
      // 未知标签按透明容器处理，内容不丢
      return xmlBlocks(el);
  }
}

function xmlBlocks(parent: XElement): JsonRecord[] {
  const blocks: JsonRecord[] = [];
  for (const child of parent.children) {
    if (child.kind === 'el') {
      blocks.push(...xmlBlocksFromElement(child));
      continue;
    }
    // 块级上下文的散文本按行拆段落
    const text = child.text;
    if (text.trim() === '') continue;
    for (const line of text.split(/\r?\n/)) {
      if (line.trim() === '') continue;
      blocks.push(paragraphJson([textJson(line)]));
    }
  }
  return blocks;
}

/**
 * 把 LiteXML 字符串解析成 Lexical EditorState JSON 对象（jsonToLiteXML 的逆操作）。
 * 解析失败（无任何可识别容器且无内容）返回 null；产出可被 editor.parseEditorState
 * 或 headless editor 直接消费的最小合法 JSON。
 */
export function liteXMLToJson(xml: string): SerializedEditorState | null {
  const doc = parseXmlTree(xml);
  if (doc.children.length === 0) return null;
  const container =
    findElement(doc, 'root') ?? findElement(doc, 'body') ?? doc;
  const children = xmlBlocks(container);
  return {
    root: { children, type: 'root', version: 1 },
  } as unknown as SerializedEditorState;
}

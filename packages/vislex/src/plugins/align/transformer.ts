import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $isParagraphNode,
  $isTextNode,
  ParagraphNode,
  type ElementFormatType,
  type ElementNode,
  type LexicalNode,
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
  type HeadingTagType,
} from '@lexical/rich-text';
import type { ElementTransformer } from '@lexical/markdown';

/**
 * 块级对齐 Markdown 往返。
 *
 * 语法：块尾标记 ` {:center}` / ` {:right}` / ` {:justify}`（左对齐为默认，不写标记）。
 * 支持段落、标题、引用（引用的标记写在首行）。
 *
 * 数组排序约束（import 与 export 都按序取首个命中的转换器）：
 * - 标题 / 引用转换器必须排在内置 HEADING / QUOTE 之前，否则标记会被当作普通文本；
 * - 段落转换器必须排在列表转换器之后，避免吞掉尾部带标记的列表行（列表对齐不持久化）。
 */

type AlignFormat = 'left' | 'center' | 'right' | 'justify';

const ALIGN_FORMATS: readonly AlignFormat[] = ['left', 'center', 'right', 'justify'];

function toAlignFormat(raw: string): AlignFormat {
  return (ALIGN_FORMATS as string[]).includes(raw) ? (raw as AlignFormat) : 'left';
}

/** 导出时生成块尾标记；left / start / 空 视为默认左对齐，不写标记 */
function alignMarker(formatType: ElementFormatType): string {
  return formatType === 'center' || formatType === 'right' || formatType === 'justify'
    ? ` {:${formatType}}`
    : '';
}

/**
 * 构造带对齐的块节点并替换原块。
 * - import：children[0] 是被切掉整行后的空文本节点，重置为去标记正文并复用，
 *   保证随后的行内格式（加粗 / 链接 / 公式）继续在同一个节点上解析；
 * - 输入快捷键：原文本节点由调用方（runElementTransformers）移除，这里重建正文文本，
 *   children 为光标后的剩余兄弟节点，原样接在正文之后。
 */
function $replaceWithAlignedBlock(
  parentNode: ElementNode,
  children: LexicalNode[],
  content: string,
  format: AlignFormat,
  isImport: boolean,
  createNode: () => ElementNode,
): void {
  const node = createNode();
  node.setFormat(format);

  if (isImport) {
    const first = children[0];
    if (first && $isTextNode(first)) {
      first.setTextContent(content);
    }
    node.append(...children);
  } else {
    node.append($createTextNode(content), ...children);
  }

  parentNode.replace(node);

  if (!isImport) {
    // 光标落到正文末尾，便于继续输入
    const textNode = node.getFirstChild();
    if ($isTextNode(textNode)) {
      textNode.select(textNode.getTextContentSize(), textNode.getTextContentSize());
    } else {
      node.select(0, 0);
    }
  }
}

/** 标题对齐：`## 标题 {:center}` */
export const ALIGN_HEADING_TRANSFORMER: ElementTransformer = {
  type: 'element',
  dependencies: [HeadingNode],
  regExp: /^(#{1,6})\s+(.*?)\s*\{:(left|center|right|justify)\}\s*$/,
  export: (node, exportChildren) => {
    if (!$isHeadingNode(node)) return null;
    const marker = alignMarker(node.getFormatType());
    if (!marker) return null; // 无对齐：交回内置 HEADING 导出
    const level = Number(node.getTag().slice(1));
    return '#'.repeat(level) + ' ' + exportChildren(node) + marker;
  },
  replace: (parentNode, children, match, isImport) => {
    // 输入快捷键场景只接管段落，避免破坏引用 / 列表项等容器
    if (!isImport && !$isParagraphNode(parentNode)) return false;
    const [, hashes, content, rawFormat] = match;
    const tag = ('h' + hashes.length) as HeadingTagType;
    const format = toAlignFormat(rawFormat);
    $replaceWithAlignedBlock(parentNode, children, content, format, isImport, () =>
      $createHeadingNode(tag),
    );
  },
};

/** 引用对齐：`> 内容 {:center}`（标记在首行） */
export const ALIGN_QUOTE_TRANSFORMER: ElementTransformer = {
  type: 'element',
  dependencies: [QuoteNode],
  regExp: /^>\s+(.*?)\s*\{:(left|center|right|justify)\}\s*$/,
  export: (node, exportChildren) => {
    if (!$isQuoteNode(node)) return null;
    const marker = alignMarker(node.getFormatType());
    if (!marker) return null; // 无对齐：交回内置 QUOTE 导出
    const lines = exportChildren(node).split('\n');
    return lines.map((line, index) => '> ' + (index === 0 ? line + marker : line)).join('\n');
  },
  replace: (parentNode, children, match, isImport) => {
    if (!isImport && !$isParagraphNode(parentNode)) return false;
    const [, content, rawFormat] = match;
    const format = toAlignFormat(rawFormat);

    if (isImport) {
      // 与内置 QUOTE 一致：紧跟上一条引用时合并内容，此行标记不生效
      //（Markdown 里两条相邻引用无法区分，合并后只保留一个对齐设置）
      const previousNode = parentNode.getPreviousSibling();
      if ($isQuoteNode(previousNode)) {
        const first = children[0];
        if (first && $isTextNode(first)) {
          first.setTextContent(content);
        }
        previousNode.splice(previousNode.getChildrenSize(), 0, [
          $createLineBreakNode(),
          ...children,
        ]);
        parentNode.remove();
        return;
      }
    }

    $replaceWithAlignedBlock(parentNode, children, content, format, isImport, () =>
      $createQuoteNode(),
    );
  },
};

/** 段落对齐：`正文 {:center}` */
export const ALIGN_PARAGRAPH_TRANSFORMER: ElementTransformer = {
  type: 'element',
  dependencies: [ParagraphNode],
  // 负向前瞻排除标题 / 引用 / 列表行，这些行由各自的对齐或内置转换器接管
  regExp: /^(?![ \t]*(?:#{1,6}\s|>|(?:[-*+]|\d+\.)\s))(.*?)\s*\{:(left|center|right|justify)\}\s*$/,
  export: (node, exportChildren) => {
    if (!$isParagraphNode(node)) return null;
    const marker = alignMarker(node.getFormatType());
    if (!marker) return null; // 无对齐：交回默认导出（纯子文本）
    return exportChildren(node) + marker;
  },
  replace: (parentNode, children, match, isImport) => {
    if (!isImport && !$isParagraphNode(parentNode)) return false;
    const [, content, rawFormat] = match;
    const format = toAlignFormat(rawFormat);
    $replaceWithAlignedBlock(parentNode, children, content, format, isImport, () =>
      $createParagraphNode(),
    );
  },
};

/**
 * 对齐转换器集合（顺序即优先级：标题 → 引用 → 段落）。
 * 在 core 端需按注释约束与内置转换器交错放置，见 lexical.service.ts。
 */
export const ALIGN_TRANSFORMERS: ElementTransformer[] = [
  ALIGN_HEADING_TRANSFORMER,
  ALIGN_QUOTE_TRANSFORMER,
  ALIGN_PARAGRAPH_TRANSFORMER,
];

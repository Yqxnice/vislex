import {
  $createTextNode,
  $isElementNode,
  type ElementNode,
  type LexicalNode,
  type ParagraphNode,
} from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import {
  $createTableNodeWithDimensions,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  TableNode,
  TableRowNode,
  TableCellNode,
} from '@lexical/table';

/**
 * GFM 管道表格 Markdown 往返（headless 同构副本）。
 *
 * 与 packages/vislex/src/plugins/table/transformer.ts 保持同步：
 * 格式（首行为表头，第二行为分隔行，其后为数据行）：
 * | a | b |
 * | :--- | ---: |
 * | 1 | 2 |
 *
 * 对齐：分隔行的 `:---` / `:---:` / `---:` 映射为该列单元格内段落的 format。
 * 单元格内多个段落导出时以空格合并（GFM 单行限制）；`|` 导出时转义为 `\|`。
 *
 * 注意（两端一致）：0.52 无内置表格转换器，这是自写实现。
 */

/** 按未转义的竖线拆分一行单元格（行首尾竖线可省略） */
function parseRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) return null;
  const body = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  return body
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim())
    .map((cell) => cell.replace(/\\\|/g, '|'));
}

/** 分隔行单元格：---、:---、:---:、---: */
function isDividerCell(cell: string): boolean {
  return /^:?-{1,}:?$/.test(cell);
}

type ColumnAlign = 'center' | 'right' | undefined;

function parseAlign(cell: string): ColumnAlign {
  if (/^:-+:$/.test(cell)) return 'center';
  if (/^-+:$/.test(cell)) return 'right';
  return undefined;
}

function alignToDivider(format: string): string {
  if (format === 'center') return ':---:';
  if (format === 'right') return '---:';
  return '---';
}

function escapeCell(text: string): string {
  return text.replace(/\|/g, '\\|');
}

/** 单元格内段落拼成单行文本（多段落以空格合并） */
function cellToText(cell: TableCellNode, traverseChildren: (node: ElementNode) => string): string {
  const parts: string[] = [];
  for (const child of cell.getChildren()) {
    if ($isElementNode(child)) {
      const text = traverseChildren(child).trim();
      if (text) parts.push(text);
    }
  }
  return parts.join(' ');
}

/** 把文本写入单元格：清空后写首个段落，并应用列对齐 */
function fillCell(cell: TableCellNode, text: string, align?: ColumnAlign): void {
  const paragraph = cell.getFirstChild<ParagraphNode>();
  if (!paragraph) return;
  paragraph.clear();
  if (align) paragraph.setFormat(align);
  if (text) paragraph.append($createTextNode(text));
}

const tableTransformer: MultilineElementTransformer = {
  type: 'multiline-element',
  dependencies: [TableNode, TableRowNode, TableCellNode],
  regExpStart: /^[ \t]*\|.*\|[ \t]*$/,

  export: (node: LexicalNode, traverseChildren: (node: ElementNode) => string) => {
    if (!$isTableNode(node)) return null;
    const rows = node.getChildren().filter($isTableRowNode) as TableRowNode[];
    if (rows.length === 0) return null;

    const lines: string[] = [];
    let columnCount = 0;
    const aligns: string[] = [];

    rows.forEach((row, rowIndex) => {
      const cells = row.getChildren().filter($isTableCellNode) as TableCellNode[];
      columnCount = Math.max(columnCount, cells.length);
      const texts = cells.map((cell) => escapeCell(cellToText(cell, traverseChildren)) || ' ');
      lines.push(`| ${texts.join(' | ')} |`);

      if (rowIndex === 0) {
        // 分隔行：对齐取自每列表头单元格内段落的 format
        for (let col = 0; col < columnCount; col++) {
          const paragraph = cells[col]?.getFirstChild<ParagraphNode>();
          aligns.push(alignToDivider(paragraph?.getFormatType() ?? ''));
        }
        lines.push(`| ${aligns.join(' | ')} |`);
      }
    });

    return lines.join('\n');
  },

  replace: () => {
    // 导入完全由 handleImportAfterStartMatch 处理；输入快捷键不支持表格（返回 false 取消）
    return false;
  },

  handleImportAfterStartMatch: ({ lines, rootNode, startLineIndex, startMatch }) => {
    const headerCells = parseRow(startMatch[0]);
    if (!headerCells || headerCells.length === 0) return null;

    const dividerIndex = startLineIndex + 1;
    const dividerCells = dividerIndex < lines.length ? parseRow(lines[dividerIndex]) : null;
    if (!dividerCells || dividerCells.length !== headerCells.length) return null;
    if (!dividerCells.every(isDividerCell)) return null;
    const aligns = dividerCells.map(parseAlign);

    const bodyRows: string[][] = [];
    let lastLineIndex = dividerIndex;
    for (let i = dividerIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!/^[ \t]*\|.*\|[ \t]*$/.test(line)) break;
      const cells = parseRow(line);
      if (!cells) break;
      bodyRows.push(cells);
      lastLineIndex = i;
    }

    const columnCount = headerCells.length;
    const rowCount = 1 + bodyRows.length;
    const table = $createTableNodeWithDimensions(rowCount, columnCount, { rows: true, columns: false });

    const fillRow = (row: TableRowNode, texts: string[]) => {
      const cells = row.getChildren().filter($isTableCellNode) as TableCellNode[];
      for (let col = 0; col < columnCount; col++) {
        fillCell(cells[col] as TableCellNode, texts[col] ?? '', aligns[col]);
      }
    };

    const tableRows = table.getChildren().filter($isTableRowNode) as TableRowNode[];
    fillRow(tableRows[0] as TableRowNode, headerCells);
    bodyRows.forEach((texts, i) => fillRow(tableRows[i + 1] as TableRowNode, texts));

    rootNode.append(table);
    return [true, lastLineIndex];
  },
};

export const TABLE_TRANSFORMERS: MultilineElementTransformer[] = [tableTransformer];

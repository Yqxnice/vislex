import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  type EditorThemeClasses,
} from 'lexical';
import { Table2 } from 'lucide-react';
import type { EditorPlugin } from '../../types';
import { TableToolbar } from './TableToolbar';
import { TABLE_TRANSFORMERS } from './transformer';
import { $isTableNode, INSERT_TABLE_COMMAND, TableNode, TableRowNode, TableCellNode } from '@lexical/table';

const tableTheme: Pick<EditorThemeClasses, 'table' | 'tableRow' | 'tableCell' | 'tableCellHeader' | 'tableCellSelected'> = {
  table: 'my-2.5 w-full table-fixed border-collapse',
  tableRow: '',
  tableCell: 'relative border border-vl-border-strong px-2 py-1 align-top [&_p]:m-0 [&_p]:min-h-[1.4em]',
  tableCellHeader: 'bg-vl-code-bg text-left font-semibold',
  tableCellSelected:
    'relative after:pointer-events-none after:absolute after:inset-0 after:bg-blue-600/[0.12] dark:after:bg-blue-500/20',
};

/**
 * 表格（@lexical/table，标准编辑、无单元格合并）。
 * - TablePlugin 提供单元格选择 / Tab 导航 / 命令注册；
 * - 光标在表格内时出现浮动操作条（增删行列、表头切换、删除表格）；
 * - Markdown：GFM 管道表（自写转换器）。
 */
export const tablePlugin: EditorPlugin = {
  name: 'table',
  nodes: [TableNode, TableRowNode, TableCellNode],
  transformers: TABLE_TRANSFORMERS,
  theme: tableTheme,
  toolbar: [
    {
      id: 'table',
      label: <Table2 size={16} />,
      title: '插入表格',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return selection.anchor.getNode().getTopLevelElement()?.getType() === 'table';
      },
      run: (editor) => {
        editor.update(() => {
          // TablePlugin（registerTablePlugin）注册了 INSERT_TABLE_COMMAND
          editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            rows: '3',
            columns: '3',
            includeHeaders: { rows: true, columns: false },
          });
          // 表格后补一个空段落，方便继续在下方书写
          const last = $getRoot().getLastChild();
          if (last && $isTableNode(last)) {
            const paragraph = $createParagraphNode();
            last.insertAfter(paragraph);
            paragraph.select();
          }
        });
      },
    },
  ],
  render: () => (
    <>
      <TablePlugin hasCellMerge={false} hasCellBackgroundColor={false} />
      <TableToolbar />
    </>
  ),
};

export { TABLE_TRANSFORMERS } from './transformer';

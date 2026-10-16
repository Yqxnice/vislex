import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  type EditorThemeClasses,
} from 'lexical';
import { Table2 } from 'lucide-react';
import type { EditorPlugin } from '../../types.js';
import { TableToolbar } from './TableToolbar.js';
import { TABLE_TRANSFORMERS } from './transformer.js';
import { $isTableNode, INSERT_TABLE_COMMAND, TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import * as css from './tableTheme.css';

const tableTheme: Pick<EditorThemeClasses, 'table' | 'tableRow' | 'tableCell' | 'tableCellHeader' | 'tableCellSelected'> = {
  table: css.table,
  tableRow: '',
  tableCell: css.tableCell,
  tableCellHeader: css.tableCellHeader,
  tableCellSelected: css.tableCellSelected,
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

export { TABLE_TRANSFORMERS } from './transformer.js';

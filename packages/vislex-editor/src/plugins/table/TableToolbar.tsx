import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $setTableColumnIsHeader,
  $setTableRowIsHeader,
  TableCellHeaderStates,
  $isTableSelection,
  type TableCellNode,
  type TableRowNode,
} from '@lexical/table';
import { $getSelection, $getNodeByKey, $isRangeSelection } from 'lexical';
import * as css from './tableToolbar.css';

/**
 * 表格浮动操作条：光标 / 选区落在表格内时显示。
 * 激活态在 registerUpdateListener 中计算（不能在渲染期读取 selection）。
 */
export function TableToolbar() {
  const [editor] = useLexicalComposerContext();
  const [inTable, setInTable] = useState(false);
  const [editable, setEditable] = useState(() => editor.isEditable());

  useEffect(() => editor.registerEditableListener(setEditable), [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        let cell: TableCellNode | null = null;
        if ($isRangeSelection(selection)) {
          cell = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());
        } else if ($isTableSelection(selection)) {
          const focusNode = $getNodeByKey(selection.focus.key);
          cell = focusNode ? $getTableCellNodeFromLexicalNode(focusNode) : null;
        }
        setInTable(cell !== null);
      });
    });
  }, [editor]);

  if (!inTable || !editable) return null;

  const run = (fn: () => void) => editor.update(fn);

  const toggleRowHeader = () =>
    run(() => {
      const selection = $getSelection();
      const anchor = $isRangeSelection(selection) ? selection.anchor.getNode() : null;
      if (!anchor) return;
      const cell = $getTableCellNodeFromLexicalNode(anchor);
      if (!cell) return;
      const table = $getTableNodeFromLexicalNodeOrThrow(cell);
      const firstRow = table.getFirstChild<TableRowNode>();
      const firstCell = firstRow?.getFirstChild<TableCellNode>();
      $setTableRowIsHeader(table, 0, !firstCell?.hasHeaderState(TableCellHeaderStates.ROW));
    });

  const toggleColumnHeader = () =>
    run(() => {
      const selection = $getSelection();
      const anchor = $isRangeSelection(selection) ? selection.anchor.getNode() : null;
      if (!anchor) return;
      const cell = $getTableCellNodeFromLexicalNode(anchor);
      if (!cell) return;
      const table = $getTableNodeFromLexicalNodeOrThrow(cell);
      const firstRow = table.getFirstChild<TableRowNode>();
      const firstCell = firstRow?.getFirstChild<TableCellNode>();
      $setTableColumnIsHeader(table, 0, !firstCell?.hasHeaderState(TableCellHeaderStates.COLUMN));
    });

  const removeTable = () =>
    run(() => {
      const selection = $getSelection();
      const anchor = $isRangeSelection(selection) ? selection.anchor.getNode() : null;
      if (!anchor) return;
      const cell = $getTableCellNodeFromLexicalNode(anchor);
      if (!cell) return;
      $getTableNodeFromLexicalNodeOrThrow(cell).remove();
    });

  return (
    <div
      className={css.toolbar}
      contentEditable={false}
    >
      <button type="button" title="在上方插入行" onClick={() => run(() => void $insertTableRowAtSelection(false))}>
        上↑行
      </button>
      <button type="button" title="在下方插入行" onClick={() => run(() => void $insertTableRowAtSelection(true))}>
        下↓行
      </button>
      <button type="button" title="在左侧插入列" onClick={() => run(() => void $insertTableColumnAtSelection(false))}>
        左←列
      </button>
      <button type="button" title="在右侧插入列" onClick={() => run(() => void $insertTableColumnAtSelection(true))}>
        右→列
      </button>
      <button type="button" title="删除当前行" onClick={() => run(() => $deleteTableRowAtSelection())}>
        删行
      </button>
      <button type="button" title="删除当前列" onClick={() => run(() => $deleteTableColumnAtSelection())}>
        删列
      </button>
      <button type="button" title="切换首行表头" onClick={toggleRowHeader}>
        表头行
      </button>
      <button type="button" title="切换首列表头" onClick={toggleColumnHeader}>
        表头列
      </button>
      <button type="button" title="删除整个表格" className={css.danger} onClick={removeTable}>
        删表格
      </button>
    </div>
  );
}

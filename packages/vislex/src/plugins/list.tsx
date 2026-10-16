import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
  type ListType,
} from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { $getSelection, $isRangeSelection, type LexicalCommand } from 'lexical';
import type { ReactNode } from 'react';
import { List, ListOrdered } from 'lucide-react';
import type { EditorPlugin, ToolbarItem } from '../types';

/** 选区当前所处的列表类型，不在列表里则返回 null */
function $getCurrentListType(): ListType | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  const list = selection.anchor
    .getNode()
    .getParents()
    .find((parent) => $isListNode(parent));
  return list ? list.getListType() : null;
}

function listButton(
  id: string,
  label: ReactNode,
  title: string,
  type: ListType,
  insertCommand: LexicalCommand<void>,
): ToolbarItem {
  return {
    id,
    label,
    title,
    isActive: () => $getCurrentListType() === type,
    run: (editor) => {
      if (editor.read($getCurrentListType) === type) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(insertCommand, undefined);
      }
    },
  };
}

/** 列表：无序 / 有序，支持按 Markdown 快捷语法输入 */
export const listPlugin: EditorPlugin = {
  name: 'list',
  nodes: [ListNode, ListItemNode],
  toolbar: [
    listButton('ul', <List size={16} />, '无序列表', 'bullet', INSERT_UNORDERED_LIST_COMMAND),
    listButton('ol', <ListOrdered size={16} />, '有序列表', 'number', INSERT_ORDERED_LIST_COMMAND),
  ],
  render: () => <ListPlugin />,
};

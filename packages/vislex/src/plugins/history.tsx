import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { Redo2, Undo2 } from 'lucide-react';
import type { EditorPlugin } from '../types';

/**
 * 撤销 / 重做。
 * 说明：按钮的可用状态依赖 CAN_UNDO_COMMAND / CAN_REDO_COMMAND 这类「编辑器事件」，
 * 不属于编辑器状态，因此阶段 1 不做置灰，点击无效栈时不产生副作用。
 */
export const historyPlugin: EditorPlugin = {
  name: 'history',
  toolbar: [
    {
      id: 'undo',
      label: <Undo2 size={16} />,
      title: '撤销',
      run: (editor) => editor.dispatchCommand(UNDO_COMMAND, undefined),
    },
    {
      id: 'redo',
      label: <Redo2 size={16} />,
      title: '重做',
      run: (editor) => editor.dispatchCommand(REDO_COMMAND, undefined),
    },
  ],
  render: () => <HistoryPlugin />,
};

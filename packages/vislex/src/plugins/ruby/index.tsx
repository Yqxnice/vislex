import { $getSelection, $isRangeSelection } from 'lexical';
import { SquareAsterisk } from 'lucide-react';
import type { EditorPlugin } from '../../types';
import { OPEN_RUBY_MODAL_COMMAND } from './commands';
import { $createRubyNode, $isRubyNode, RubyNode } from './RubyNode';
import { RUBY_TRANSFORMERS } from './transformer';

/**
 * Ruby 注音（行内，<ruby>base<rt>rt</rt></ruby>）。
 * - 工具栏：有选中文本时作为注音对象，否则插入空节点并打开编辑框；
 * - 点击节点可再次编辑；
 * - Markdown：<ruby>base<rt>rt</rt></ruby>，与 LiteXML 行内标签同语法。
 */
export const rubyPlugin: EditorPlugin = {
  name: 'ruby',
  nodes: [RubyNode],
  transformers: RUBY_TRANSFORMERS,
  toolbar: [
    {
      id: 'ruby',
      label: <SquareAsterisk size={16} />,
      title: 'Ruby 注音',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return $isRubyNode(selection.anchor.getNode());
      },
      run: (editor) => {
        let pendingKey: string | null = null;
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          const selectedText = selection.getTextContent();
          const node = $createRubyNode(selectedText, '');
          selection.insertNodes([node]);
          pendingKey = node.getKey();
        });
        if (pendingKey) {
          setTimeout(() => editor.dispatchCommand(OPEN_RUBY_MODAL_COMMAND, { nodeKey: pendingKey! }), 0);
        }
      },
    },
  ],
};

export { $createRubyNode, $isRubyNode, RubyNode } from './RubyNode';
export type { SerializedRubyNode } from './RubyNode';
export { RUBY_TRANSFORMERS } from './transformer';
export { OPEN_RUBY_MODAL_COMMAND } from './commands';

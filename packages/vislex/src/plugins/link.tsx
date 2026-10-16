import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $getSelection, $isRangeSelection } from 'lexical';
import { Link } from 'lucide-react';
import type { EditorPlugin } from '../types';

/**
 * 链接。
 * 阶段 1 用 window.prompt 取地址，先把链路跑通；
 * 阶段 2 再换成基于浮动面板的链接编辑 UI。
 */
export const linkPlugin: EditorPlugin = {
  name: 'link',
  nodes: [LinkNode],
  toolbar: [
    {
      id: 'link',
      label: <Link size={16} />,
      title: '插入链接',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return selection.anchor
          .getNode()
          .getParents()
          .some((parent) => $isLinkNode(parent));
      },
      run: (editor) => {
        const input = window.prompt('请输入链接地址（留空则取消链接）', 'https://');
        if (input === null) return;
        const url = input.trim();
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url === '' ? null : url);
      },
    },
  ],
  render: () => <LinkPlugin />,
};

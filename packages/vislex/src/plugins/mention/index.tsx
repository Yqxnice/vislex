import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  $getSelection,
  $getNodeByKey,
  $isRangeSelection,
} from 'lexical';
import { AtSign } from 'lucide-react';
import type { EditorPlugin } from '../../types';
import { MentionModal } from './MentionModal';
import { $createMentionNode, $isMentionNode, MentionNode } from './MentionNode';

/** 通知插件打开某个 mention 节点的编辑弹层（CLICK_COMMAND 处理器派发） */
export const OPEN_MENTION_MODAL_COMMAND = createCommand<{ nodeKey: string }>('OPEN_MENTION_MODAL');

/** 弹层宿主：监听 OPEN_MENTION_MODAL_COMMAND，编辑 / 删除目标 mention 节点 */
function MentionModalHost() {
  const [editor] = useLexicalComposerContext();
  const [targetKey, setTargetKey] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [id, setId] = useState<string | undefined>(undefined);

  useEffect(() => {
    return editor.registerCommand(
      OPEN_MENTION_MODAL_COMMAND,
      ({ nodeKey }) => {
        const node = $getNodeByKey(nodeKey);
        if (!$isMentionNode(node)) return false;
        setName(node.getTextContent().replace(/^@/, ''));
        setId(node.getMentionId());
        setTargetKey(nodeKey);
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  if (!targetKey) return null;

  const close = () => setTargetKey(null);

  return createPortal(
    <MentionModal
      initialName={name}
      initialId={id}
      onCancel={close}
      onSave={(nextName, nextId) => {
        editor.update(() => {
          const node = $getNodeByKey(targetKey);
          if ($isMentionNode(node)) {
            node.setTextContent(nextName.startsWith('@') ? nextName : `@${nextName}`);
            node.setMentionId(nextId);
          }
        });
        close();
      }}
      onDelete={() => {
        editor.update(() => {
          const node = $getNodeByKey(targetKey);
          if ($isMentionNode(node)) node.remove();
        });
        close();
      }}
    />,
    document.body,
  );
}

/**
 * Mention（@提及，手动输入名字 + 可选 ID）。
 * - 工具栏插入：有选中文本时作为名字，否则插入空 mention 并打开弹层；
 * - 点击节点打开编辑弹层（改名 / 改 ID / 删除）；
 * - Markdown：[@名字](mention:id)，必须排在内置 LINK 转换器之前。
 */
export const mentionPlugin: EditorPlugin = {
  name: 'mention',
  nodes: [MentionNode],
  register: (editor) => {
    return editor.registerCommand(
      CLICK_COMMAND,
      (event: MouseEvent) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        const node = selection.anchor.getNode();
        if (!$isMentionNode(node)) return false;
        event.preventDefault();
        editor.dispatchCommand(OPEN_MENTION_MODAL_COMMAND, { nodeKey: node.getKey() });
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  },
  toolbar: [
    {
      id: 'mention',
      label: <AtSign size={16} />,
      title: '插入提及',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return $isMentionNode(selection.anchor.getNode());
      },
      run: (editor) => {
        let pendingKey: string | null = null;
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          const selectedText = selection.getTextContent().trim();
          const node = $createMentionNode(selectedText);
          selection.insertNodes([node]);
          pendingKey = node.getKey();
        });
        if (pendingKey) {
          setTimeout(() => editor.dispatchCommand(OPEN_MENTION_MODAL_COMMAND, { nodeKey: pendingKey! }), 0);
        }
      },
    },
  ],
  render: () => <MentionModalHost />,
};

export { $createMentionNode, $isMentionNode, MentionNode } from './MentionNode';
export type { SerializedMentionNode } from './MentionNode';
export { MENTION_TRANSFORMERS } from './transformer';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { EditorModal } from '../../ui/EditorModal.js';
import { modalBtn, modalBtnPrimary, modalInput } from '../../ui/classes.css';
import { deleteBtn, field, fieldLabel, modalBody } from './mention.css';

interface MentionModalProps {
  initialName: string;
  initialId?: string;
  onCancel: () => void;
  onSave: (name: string, id?: string) => void;
  onDelete: () => void;
}

/**
 * Mention 编辑弹层：名字 + 可选用户 ID，可删除节点。
 * Ctrl+Enter 保存（Esc 关闭由 EditorModal 内置处理）。
 */
export function MentionModal({ initialName, initialId, onCancel, onSave, onDelete }: MentionModalProps) {
  const [name, setName] = useState(initialName);
  const [id, setId] = useState(initialId ?? '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed) onSave(trimmed, id.trim() || undefined);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [name, id, onCancel, onSave]);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, id.trim() || undefined);
  };

  return (
    <EditorModal
      open
      onClose={onCancel}
      title="编辑提及"
      width={520}
      footer={
        <>
          <button type="button" className={modalBtn} onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className={`${modalBtn} ${modalBtnPrimary}`}
            disabled={!name.trim()}
            onClick={save}
          >
            确定
          </button>
        </>
      }
    >
      <div className={modalBody}>
        <div className={field}>
          <span className={fieldLabel}>名字</span>
          <input
            className={modalInput}
            type="text"
            value={name}
            autoFocus
            placeholder="例如：张三"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                save();
              }
            }}
          />
        </div>
        <div className={field}>
          <span className={fieldLabel}>用户 ID（可选）</span>
          <input
            className={modalInput}
            type="text"
            value={id}
            placeholder="关联站内用户 ID"
            onChange={(e) => setId(e.target.value)}
          />
        </div>
        <button type="button" className={deleteBtn} onClick={onDelete}>
          <Trash2 size={14} />
          删除该提及
        </button>
      </div>
    </EditorModal>
  );
}

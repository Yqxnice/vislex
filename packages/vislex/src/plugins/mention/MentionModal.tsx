import { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import {
  modal,
  modalBackdrop,
  modalBtn,
  modalBtnPrimary,
  modalClose,
  modalFooter,
  modalHeader,
  modalInput,
  modalTitle,
} from '../../ui/classes';

interface MentionModalProps {
  initialName: string;
  initialId?: string;
  onCancel: () => void;
  onSave: (name: string, id?: string) => void;
  onDelete: () => void;
}

/**
 * Mention 编辑弹层：名字 + 可选用户 ID，可删除节点。
 * Esc 取消、Ctrl+Enter 保存。
 */
export function MentionModal({ initialName, initialId, onCancel, onSave, onDelete }: MentionModalProps) {
  const [name, setName] = useState(initialName);
  const [id, setId] = useState(initialId ?? '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
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
    <div className={modalBackdrop} onMouseDown={onCancel}>
      <div
        className={modal}
        role="dialog"
        aria-label="编辑提及"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={modalHeader}>
          <span className={modalTitle}>编辑提及</span>
          <button type="button" className={modalClose} onClick={onCancel} aria-label="关闭">
            <X size={16} />
          </button>
        </div>
        <div className="flex w-[min(520px,100%)] min-w-[380px] flex-col gap-2.5 px-3.5 py-3">
          <div className="flex flex-col gap-1">
            <span className="select-none text-xs text-vl-text-muted">名字</span>
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
          <div className="flex flex-col gap-1">
            <span className="select-none text-xs text-vl-text-muted">用户 ID（可选）</span>
            <input
              className={modalInput}
              type="text"
              value={id}
              placeholder="关联站内用户 ID"
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="cursor-pointer self-start rounded-md border border-red-500/50 bg-transparent px-2.5 py-1 text-xs text-red-500 hover:bg-red-500/[0.08]"
            onClick={onDelete}
          >
            <Trash2 size={14} />
            删除该提及
          </button>
        </div>
        <div className={modalFooter}>
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
        </div>
      </div>
    </div>
  );
}

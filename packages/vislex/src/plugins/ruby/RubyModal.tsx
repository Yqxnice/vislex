import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
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

interface RubyModalProps {
  initialBase: string;
  initialRt: string;
  onCancel: () => void;
  onSave: (base: string, rt: string) => void;
}

/**
 * Ruby 注音编辑模态窗口：注音对象 + 注音内容，下方实时预览。
 * Esc 取消、Ctrl+Enter 保存。
 */
export function RubyModal({ initialBase, initialRt, onCancel, onSave }: RubyModalProps) {
  const [base, setBase] = useState(initialBase);
  const [rt, setRt] = useState(initialRt);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (base.trim() && rt.trim()) onSave(base.trim(), rt.trim());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [base, rt, onCancel, onSave]);

  const preview = useMemo(
    () => (
      <ruby>
        {base || '（注音对象）'}
        <rt>{rt || '（注音）'}</rt>
      </ruby>
    ),
    [base, rt],
  );

  const save = () => {
    if (!base.trim() || !rt.trim()) return;
    onSave(base.trim(), rt.trim());
  };

  return (
    <div className={modalBackdrop} onMouseDown={onCancel}>
      <div
        className={modal}
        role="dialog"
        aria-label="编辑注音"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={modalHeader}>
          <span className={modalTitle}>Ruby 注音</span>
          <button type="button" className={modalClose} onClick={onCancel} aria-label="关闭">
            <X size={16} />
          </button>
        </div>
        <div className="flex w-[min(520px,100%)] min-w-[380px] flex-col gap-2.5 px-3.5 py-3">
          <div className="flex flex-col gap-1">
            <span className="select-none text-xs text-vl-text-muted">注音对象</span>
            <input
              className={modalInput}
              type="text"
              value={base}
              autoFocus
              placeholder="例如：漢字"
              onChange={(e) => setBase(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="select-none text-xs text-vl-text-muted">注音内容</span>
            <input
              className={modalInput}
              type="text"
              value={rt}
              placeholder="例如：かんじ"
              onChange={(e) => setRt(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="select-none text-xs text-vl-text-muted">预览</span>
            <div className="rounded-md border border-vl-border bg-vl-surface-muted px-2.5 py-1.5 text-sm [&_rt]:text-[0.7em] [&_rt]:select-none [&_rt]:text-vl-text-muted">{preview}</div>
          </div>
        </div>
        <div className={modalFooter}>
          <button type="button" className={modalBtn} onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className={`${modalBtn} ${modalBtnPrimary}`}
            disabled={!base.trim() || !rt.trim()}
            onClick={save}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

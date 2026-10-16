import { useEffect, useMemo, useState } from 'react';
import { EditorModal } from '../../ui/EditorModal.js';
import { modalBtn, modalBtnPrimary, modalInput } from '../../ui/classes.css';
import { field, fieldLabel, modalBody, preview } from './ruby.css';

interface RubyModalProps {
  initialBase: string;
  initialRt: string;
  onCancel: () => void;
  onSave: (base: string, rt: string) => void;
}

/**
 * Ruby 注音编辑模态窗口：注音对象 + 注音内容，下方实时预览。
 * Ctrl+Enter 保存（Esc 关闭由 EditorModal 内置处理）。
 */
export function RubyModal({ initialBase, initialRt, onCancel, onSave }: RubyModalProps) {
  const [base, setBase] = useState(initialBase);
  const [rt, setRt] = useState(initialRt);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (base.trim() && rt.trim()) onSave(base.trim(), rt.trim());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [base, rt, onCancel, onSave]);

  const previewContent = useMemo(
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
    <EditorModal
      open
      onClose={onCancel}
      title="Ruby 注音"
      width={520}
      footer={
        <>
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
        </>
      }
    >
      <div className={modalBody}>
        <div className={field}>
          <span className={fieldLabel}>注音对象</span>
          <input
            className={modalInput}
            type="text"
            value={base}
            autoFocus
            placeholder="例如：漢字"
            onChange={(e) => setBase(e.target.value)}
          />
        </div>
        <div className={field}>
          <span className={fieldLabel}>注音内容</span>
          <input
            className={modalInput}
            type="text"
            value={rt}
            placeholder="例如：かんじ"
            onChange={(e) => setRt(e.target.value)}
          />
        </div>
        <div className={field}>
          <span className={fieldLabel}>预览</span>
          <div className={preview}>{previewContent}</div>
        </div>
      </div>
    </EditorModal>
  );
}

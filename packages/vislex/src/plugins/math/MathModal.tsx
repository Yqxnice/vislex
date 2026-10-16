import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { renderMath } from './katex';
import {
  modal,
  modalBackdrop,
  modalBody,
  modalBtn,
  modalBtnPrimary,
  modalClose,
  modalFooter,
  modalHeader,
  modalPreview,
  modalPreviewLabel,
  modalTextarea,
  modalTitle,
} from '../../ui/classes';

interface MathModalProps {
  initialEquation: string;
  displayMode: boolean;
  onCancel: () => void;
  onSave: (equation: string) => void;
}

/**
 * 公式编辑模态窗口：textarea 输入 LaTeX，下方实时 KaTeX 预览。
 * 行内 / 块级共用，displayMode 决定预览渲染模式。
 */
export function MathModal({ initialEquation, displayMode, onCancel, onSave }: MathModalProps) {
  const [equation, setEquation] = useState(initialEquation);
  const previewHtml = useMemo(() => renderMath(equation, displayMode), [equation, displayMode]);

  // 回车保存，Esc 取消（textarea 内不拦截回车，用 Ctrl+Enter 保存更安全）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onSave(equation);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [equation, onCancel, onSave]);

  return (
    <div className={modalBackdrop} onMouseDown={onCancel}>
      <div
        className={`${modal} w-[min(720px,100%)]`}
        role="dialog"
        aria-label="编辑公式"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={modalHeader}>
          <span className={modalTitle}>{displayMode ? '块级公式' : '行内公式'}</span>
          <button
            type="button"
            className={modalClose}
            onClick={onCancel}
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>
        <div className={modalBody}>
          <textarea
            className={modalTextarea}
            value={equation}
            autoFocus
            placeholder="输入 LaTeX 公式，例如：x^2 + y^2 = z^2"
            onChange={(e) => setEquation(e.target.value)}
          />
          <div className={modalPreviewLabel}>预览</div>
          <div
            className={`${modalPreview} data-[display-mode=true]:text-center`}
            data-display-mode={displayMode ? 'true' : 'false'}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
        <div className={modalFooter}>
          <button type="button" className={modalBtn} onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className={`${modalBtn} ${modalBtnPrimary}`}
            onClick={() => onSave(equation)}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

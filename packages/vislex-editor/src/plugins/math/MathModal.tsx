import { useEffect, useMemo, useState } from 'react';
import { renderMath } from './katex.js';
import { EditorModal } from '../../ui/EditorModal.js';
import {
  modalBody,
  modalBtn,
  modalBtnPrimary,
  modalPreview,
  modalPreviewLabel,
  modalTextarea,
} from '../../ui/classes.css';
import { preview } from './math.css';

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

  // Ctrl+Enter 保存（Esc 关闭由 EditorModal 内置处理；textarea 内不拦截回车）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onSave(equation);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [equation, onCancel, onSave]);

  return (
    <EditorModal
      open
      onClose={onCancel}
      title={displayMode ? '块级公式' : '行内公式'}
      width={720}
      footer={
        <>
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
        </>
      }
    >
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
          className={`${modalPreview} ${preview}`}
          data-display-mode={displayMode ? 'true' : 'false'}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>
    </EditorModal>
  );
}

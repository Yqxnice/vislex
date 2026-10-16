import { useEffect, useState } from 'react';
import { useDarkMode } from './useDarkMode.js';
import { useMermaidSvg } from './useMermaidSvg.js';
import { EditorModal } from '../../ui/EditorModal.js';
import {
  modalBody,
  modalBtn,
  modalBtnPrimary,
  modalPreview,
  modalTextarea,
} from '../../ui/classes.css';
import * as css from './mermaid.css';

interface MermaidModalProps {
  initialCode: string;
  onCancel: () => void;
  onSave: (code: string) => void;
}

const PLACEHOLDER = `graph TD
  A[开始] --> B{判断}
  B -->|是| C[执行]
  B -->|否| D[结束]`;

/**
 * Mermaid 源码编辑模态窗口：textarea 输入，下方实时预览。
 * 同步类型即时出图；其余类型走官方引擎异步渲染，失败时提示错误。
 */
export function MermaidModal({ initialCode, onCancel, onSave }: MermaidModalProps) {
  const [code, setCode] = useState(initialCode);
  const dark = useDarkMode();
  const { svg, error, pending } = useMermaidSvg(code, dark);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onSave(code);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [code, onSave]);

  return (
    <EditorModal
      open
      onClose={onCancel}
      title="Mermaid 图表"
      footer={
        <>
          <button type="button" className={modalBtn} onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className={`${modalBtn} ${modalBtnPrimary}`}
            onClick={() => onSave(code)}
          >
            确定
          </button>
        </>
      }
    >
      <div className={modalBody}>
        <textarea
          className={`${modalTextarea} ${css.codeTextarea}`}
          value={code}
          autoFocus
          placeholder={PLACEHOLDER}
          spellCheck={false}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className={css.previewLabelRow}>
          预览
          <span className={css.previewLabelHint}>
            同步：流程图 / 状态图 / 序列图 / 类图 / ER 图 / XY 图；其余类型异步渲染
          </span>
        </div>
        <div className={`${modalPreview} ${css.previewBox}`}>
          {svg ? (
            <div
              className={css.canvas}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : pending ? (
            <div className={css.muted}>渲染中…</div>
          ) : code.trim() ? (
            <div className={css.errorMsg}>{error ?? '渲染失败'}</div>
          ) : (
            <div className={css.muted}>输入图表源码后在此预览</div>
          )}
        </div>
      </div>
    </EditorModal>
  );
}

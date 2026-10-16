import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useDarkMode } from './useDarkMode';
import { useMermaidSvg } from './useMermaidSvg';
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
  modalTextarea,
  modalTitle,
} from '../../ui/classes';

/** 与 MermaidComponent 保持一致的 SVG 限宽与状态文案样式 */
const mermaidCanvas = '[&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-full';
const mermaidMuted = 'text-[13px] italic text-vl-text-muted';
const mermaidErrorMsg = 'text-[13px] text-red-600 dark:text-red-400';

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
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onSave(code);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [code, onCancel, onSave]);

  return (
    <div className={modalBackdrop} onMouseDown={onCancel}>
      <div
        className={modal}
        role="dialog"
        aria-label="编辑 Mermaid 图表"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={modalHeader}>
          <span className={modalTitle}>Mermaid 图表</span>
          <button type="button" className={modalClose} onClick={onCancel} aria-label="关闭">
            <X size={16} />
          </button>
        </div>
        <div className={modalBody}>
          <textarea
            className={`${modalTextarea} min-h-40`}
            value={code}
            autoFocus
            placeholder={PLACEHOLDER}
            spellCheck={false}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="flex flex-wrap items-baseline gap-2 text-xs text-vl-text-muted">
            预览
            <span className="text-[11px] opacity-80">
              同步：流程图 / 状态图 / 序列图 / 类图 / ER 图 / XY 图；其余类型异步渲染
            </span>
          </div>
          <div className={`${modalPreview} min-h-[120px]`}>
            {svg ? (
              <div
                className={mermaidCanvas}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : pending ? (
              <div className={mermaidMuted}>渲染中…</div>
            ) : code.trim() ? (
              <div className={mermaidErrorMsg}>{error ?? '渲染失败'}</div>
            ) : (
              <div className={mermaidMuted}>输入图表源码后在此预览</div>
            )}
          </div>
        </div>
        <div className={modalFooter}>
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
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
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

interface EmbedModalProps {
  initialSrc: string;
  initialTitle?: string;
  onCancel: () => void;
  onSave: (src: string, title?: string) => void;
}

/**
 * 嵌入编辑模态窗口：URL（B 站 / YouTube 等播放页或分享地址）+ 可选标题。
 * Esc 取消、Ctrl+Enter 保存。
 */
export function EmbedModal({ initialSrc, initialTitle, onCancel, onSave }: EmbedModalProps) {
  const [src, setSrc] = useState(initialSrc);
  const [title, setTitle] = useState(initialTitle ?? '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const trimmed = src.trim();
        if (trimmed) onSave(trimmed, title.trim() || undefined);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [src, title, onCancel, onSave]);

  const save = () => {
    const trimmed = src.trim();
    if (!trimmed) return;
    onSave(trimmed, title.trim() || undefined);
  };

  return (
    <div className={modalBackdrop} onMouseDown={onCancel}>
      <div
        className={modal}
        role="dialog"
        aria-label="编辑嵌入"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={modalHeader}>
          <span className={modalTitle}>编辑嵌入</span>
          <button type="button" className={modalClose} onClick={onCancel} aria-label="关闭">
            <X size={16} />
          </button>
        </div>
        <div className="flex w-[min(520px,100%)] min-w-[380px] flex-col gap-2.5 px-3.5 py-3">
          <div className="flex flex-col gap-1">
            <span className="select-none text-xs text-vl-text-muted">嵌入地址</span>
            <input
              className={modalInput}
              type="text"
              value={src}
              autoFocus
              placeholder="https://…（B 站 / YouTube 等可嵌入页面）"
              onChange={(e) => setSrc(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="select-none text-xs text-vl-text-muted">标题（可选）</span>
            <input
              className={modalInput}
              type="text"
              value={title}
              placeholder="嵌入内容描述"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <span className="text-xs text-vl-text-muted">以 iframe 沙箱渲染，仅展示允许被嵌入的页面</span>
        </div>
        <div className={modalFooter}>
          <button type="button" className={modalBtn} onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className={`${modalBtn} ${modalBtnPrimary}`}
            disabled={!src.trim()}
            onClick={save}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

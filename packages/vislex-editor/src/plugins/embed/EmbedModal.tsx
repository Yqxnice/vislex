import { useEffect, useState } from 'react';
import { EditorModal } from '../../ui/EditorModal.js';
import { modalBtn, modalBtnPrimary, modalInput } from '../../ui/classes.css';
import * as css from './embed.css';

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

  // Ctrl+Enter 保存（Esc 关闭由 EditorModal 内置处理）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const trimmed = src.trim();
        if (trimmed) onSave(trimmed, title.trim() || undefined);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [src, title, onSave]);

  const save = () => {
    const trimmed = src.trim();
    if (!trimmed) return;
    onSave(trimmed, title.trim() || undefined);
  };

  return (
    <EditorModal
      open
      onClose={onCancel}
      title="编辑嵌入"
      footer={
        <>
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
        </>
      }
    >
      <div className={css.formBody}>
        <div className={css.field}>
          <span className={css.fieldLabel}>嵌入地址</span>
          <input
            className={modalInput}
            type="text"
            value={src}
            autoFocus
            placeholder="https://…（B 站 / YouTube 等可嵌入页面）"
            onChange={(e) => setSrc(e.target.value)}
          />
        </div>
        <div className={css.field}>
          <span className={css.fieldLabel}>标题（可选）</span>
          <input
            className={modalInput}
            type="text"
            value={title}
            placeholder="嵌入内容描述"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <span className={css.hint}>以 iframe 沙箱渲染，仅展示允许被嵌入的页面</span>
      </div>
    </EditorModal>
  );
}

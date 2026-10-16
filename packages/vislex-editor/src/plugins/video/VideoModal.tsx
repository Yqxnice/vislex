import { useEffect, useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { useVideoStorage } from './storage.js';
import { EditorModal } from '../../ui/EditorModal.js';
import { modalBtn, modalBtnPrimary, modalInput } from '../../ui/classes.css';
import * as css from './video.css';

interface VideoModalProps {
  initialSrc: string;
  initialPoster?: string;
  initialTitle?: string;
  onCancel: () => void;
  onSave: (src: string, poster?: string, title?: string) => void;
}

/**
 * 视频编辑模态窗口。
 * - URL 输入 + 可选本地上传（storage 未注入时上传入口禁用）；
 * - 下方实时预览；Esc 取消、Ctrl+Enter 保存。
 */
export function VideoModal({ initialSrc, initialPoster, initialTitle, onCancel, onSave }: VideoModalProps) {
  const storage = useVideoStorage();
  const [src, setSrc] = useState(initialSrc);
  const [poster, setPoster] = useState(initialPoster ?? '');
  const [title, setTitle] = useState(initialTitle ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ctrl+Enter 保存（Esc 关闭由 EditorModal 内置处理）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const trimmed = src.trim();
        if (trimmed && !uploading) onSave(trimmed, poster.trim() || undefined, title.trim() || undefined);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [src, poster, title, uploading, onSave]);

  const handleUpload = async (file: File) => {
    if (!storage) return;
    setUploading(true);
    setUploadError('');
    try {
      setSrc(await storage.upload(file));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    const trimmed = src.trim();
    if (!trimmed || uploading) return;
    onSave(trimmed, poster.trim() || undefined, title.trim() || undefined);
  };

  const previewSrc = src.trim();

  return (
    <EditorModal
      open
      onClose={onCancel}
      title="编辑视频"
      footer={
        <>
          <button type="button" className={modalBtn} onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className={`${modalBtn} ${modalBtnPrimary}`}
            disabled={!previewSrc || uploading}
            onClick={save}
          >
            确定
          </button>
        </>
      }
    >
      <div className={css.formBody}>
        <div className={css.field}>
          <span className={css.fieldLabel}>视频地址</span>
          <input
            className={modalInput}
            type="text"
            value={src}
            autoFocus
            placeholder="https://… 或上传本地视频"
            onChange={(e) => setSrc(e.target.value)}
          />
        </div>
        <div className={css.field}>
          <span className={css.fieldLabel}>本地视频</span>
          {storage ? (
            <>
              <button
                type="button"
                className={css.uploadBtn}
                disabled={uploading}
                data-disabled={uploading ? 'true' : undefined}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Loader2 size={14} className={css.spinner} /> : <Upload size={14} />}
                {uploading ? '上传中…' : '选择文件上传'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogv"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) void handleUpload(file);
                }}
              />
            </>
          ) : (
            <span className={css.hint}>未接入存储适配器，仅支持外部视频地址</span>
          )}
          {uploadError ? <span className={css.errorText}>{uploadError}</span> : null}
        </div>
        <div className={css.field}>
          <span className={css.fieldLabel}>封面图（可选）</span>
          <input
            className={modalInput}
            type="text"
            value={poster}
            placeholder="https://…"
            onChange={(e) => setPoster(e.target.value)}
          />
        </div>
        <div className={css.field}>
          <span className={css.fieldLabel}>标题（可选）</span>
          <input
            className={modalInput}
            type="text"
            value={title}
            placeholder="视频描述"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        {previewSrc ? (
          <div className={css.previewWrap}>
            <video src={previewSrc} poster={poster.trim() || undefined} controls preload="metadata" />
          </div>
        ) : null}
      </div>
    </EditorModal>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { useVideoStorage } from './storage';
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

  // 回车保存，Esc 取消（Ctrl+Enter 兼容输入框内回车换行语义）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const trimmed = src.trim();
        if (trimmed && !uploading) onSave(trimmed, poster.trim() || undefined, title.trim() || undefined);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [src, poster, title, uploading, onCancel, onSave]);

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
    <div className={modalBackdrop} onMouseDown={onCancel}>
      <div
        className={modal}
        role="dialog"
        aria-label="编辑视频"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={modalHeader}>
          <span className={modalTitle}>编辑视频</span>
          <button type="button" className={modalClose} onClick={onCancel} aria-label="关闭">
            <X size={16} />
          </button>
        </div>
        <div className="flex w-[min(520px,100%)] min-w-[380px] flex-col gap-2.5 px-3.5 py-3">
          <div className="flex flex-col gap-1">
            <span className="select-none text-xs text-vl-text-muted">视频地址</span>
            <input
              className={modalInput}
              type="text"
              value={src}
              autoFocus
              placeholder="https://… 或上传本地视频"
              onChange={(e) => setSrc(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="select-none text-xs text-vl-text-muted">本地视频</span>
            {storage ? (
              <>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-md border border-dashed border-vl-border-strong px-2.5 py-[5px] text-xs text-vl-text-muted hover:border-vl-brand hover:text-vl-brand data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
                  disabled={uploading}
                  data-disabled={uploading ? 'true' : undefined}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
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
              <span className="text-xs text-vl-text-muted">未接入存储适配器，仅支持外部视频地址</span>
            )}
            {uploadError ? <span className="text-xs text-red-500 dark:text-red-400">{uploadError}</span> : null}
          </div>
          <div className="flex flex-col gap-1">
            <span className="select-none text-xs text-vl-text-muted">封面图（可选）</span>
            <input
              className={modalInput}
              type="text"
              value={poster}
              placeholder="https://…"
              onChange={(e) => setPoster(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="select-none text-xs text-vl-text-muted">标题（可选）</span>
            <input
              className={modalInput}
              type="text"
              value={title}
              placeholder="视频描述"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          {previewSrc ? (
            <div className="overflow-hidden rounded-lg border border-vl-border bg-black [&_video]:block [&_video]:max-h-[220px] [&_video]:w-full">
              <video src={previewSrc} poster={poster.trim() || undefined} controls preload="metadata" />
            </div>
          ) : null}
        </div>
        <div className={modalFooter}>
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
        </div>
      </div>
    </div>
  );
}

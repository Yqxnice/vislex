import { useEffect, useRef, useState, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, Image as ImageIcon, Link2, Trash2, Upload, X } from 'lucide-react';
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
import {
  normalizeGalleryImages,
  type GalleryImage,
  type GalleryLayout,
} from './GalleryNode';
import { useGalleryStorage } from './storage';

interface GalleryModalProps {
  initialLayout: GalleryLayout;
  initialImages: GalleryImage[];
  onCancel: () => void;
  onSave: (layout: GalleryLayout, images: GalleryImage[]) => void;
}

const LAYOUT_META: Array<{ value: GalleryLayout; label: string }> = [
  { value: 'grid', label: '网格' },
  { value: 'masonry', label: '瀑布流' },
  { value: 'carousel', label: '轮播' },
];

/** 图库弹窗比默认 modal 窄（760px），替换默认宽度类避免同属性冲突 */
const galleryModal = modal.replace('w-[min(880px,100%)]', 'w-[min(760px,100%)]');

const layoutBtnCls =
  'cursor-pointer rounded-md border border-vl-border-strong bg-vl-surface px-3.5 py-[5px] text-[13px] text-vl-text-muted hover:text-vl-text aria-selected:border-vl-brand aria-selected:bg-vl-brand aria-selected:text-white';
const actionBtnCls = modalBtn + ' inline-flex items-center gap-[5px]';
const rowsCls =
  'flex flex-col gap-2 p-3.5 data-[dragging=true]:rounded-lg data-[dragging=true]:outline-2 data-[dragging=true]:-outline-offset-6 data-[dragging=true]:outline-dashed data-[dragging=true]:outline-vl-brand';
const rowCls = 'flex items-center gap-2 rounded-lg border border-vl-border bg-vl-surface p-2';
const thumbCls =
  'flex size-12 flex-none items-center justify-center overflow-hidden rounded-md bg-vl-code-bg text-vl-text-muted [&_img]:size-full [&_img]:object-cover';
const opBtnCls =
  'inline-flex h-[22px] w-6 cursor-pointer items-center justify-center rounded border-0 border-transparent bg-transparent p-0 text-vl-text-muted hover:not-disabled:bg-vl-code-bg hover:not-disabled:text-vl-text disabled:cursor-not-allowed disabled:opacity-35';
const opDangerCls = opBtnCls + ' hover:not-disabled:text-red-500';

/** 粗略判定文本是否是图片地址（用于 URL 拖拽导入） */
const IMAGE_URL_RE = /^(?:https?:\/\/|\/|data:image\/)/i;

/** 编辑态的行：src 允许为空（保存时再过滤），便于逐字段填写 */
interface ImageRow {
  src: string;
  alt: string;
  caption: string;
}

function toRows(images: GalleryImage[]): ImageRow[] {
  return images.map((image) => ({
    src: image.src,
    alt: image.alt ?? '',
    caption: image.caption ?? '',
  }));
}

/**
 * 图库编辑模态窗口。
 * - 顶部切换布局；下方逐行管理图片（地址 / 替代文本 / 说明，支持排序与删除）；
 * - 已配置存储适配器时可多选上传本地图片，也可拖拽文件或图片链接到窗口；
 * - Esc 取消，Ctrl / Cmd + Enter 保存；保存时丢弃地址为空的行。
 */
export function GalleryModal({
  initialLayout,
  initialImages,
  onCancel,
  onSave,
}: GalleryModalProps) {
  const storage = useGalleryStorage();
  const [layout, setLayout] = useState<GalleryLayout>(initialLayout);
  const [rows, setRows] = useState<ImageRow[]>(() => toRows(initialImages));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const images = normalizeGalleryImages(
      rows.map((row) => ({
        src: row.src.trim(),
        alt: row.alt.trim(),
        caption: row.caption.trim(),
      })),
    );
    onSave(layout, images);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        commit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // commit 依赖当前 rows/layout，随其变化重新绑定
  });

  const updateRow = (index: number, patch: Partial<ImageRow>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const moveRow = (index: number, delta: number) => {
    setRows((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => [...prev, { src: '', alt: '', caption: '' }]);
  };

  /** 上传本地文件并追加到列表 */
  const uploadFiles = async (files: File[]) => {
    if (!storage || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: ImageRow[] = [];
      for (const file of files) {
        const url = await storage.upload(file);
        uploaded.push({ src: url, alt: file.name.replace(/\.[^.]+$/, ''), caption: '' });
      }
      if (uploaded.length > 0) setRows((prev) => [...prev, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const appendLink = (url: string) => {
    setRows((prev) => [...prev, { src: url.trim(), alt: '', caption: '' }]);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length > 0) {
      void uploadFiles(files);
      return;
    }
    const text = event.dataTransfer.getData('text/plain').trim();
    if (text && IMAGE_URL_RE.test(text)) appendLink(text);
  };

  const canUpload = !!storage && !uploading;

  return (
    <div className={modalBackdrop} onMouseDown={onCancel}>
      <div
        className={galleryModal}
        role="dialog"
        aria-label="编辑图库"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={modalHeader}>
          <span className={modalTitle}>图库</span>
          <button type="button" className={modalClose} onClick={onCancel} aria-label="关闭">
            <X size={16} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
          <div
            className="flex gap-1 border-b border-vl-border px-3.5 py-2.5"
            role="tablist"
            aria-label="布局"
          >
            {LAYOUT_META.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                className={layoutBtnCls}
                aria-selected={layout === item.value}
                onClick={() => setLayout(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-vl-border px-3.5 py-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                void uploadFiles(files);
                event.target.value = '';
              }}
            />
            <button
              type="button"
              className={actionBtnCls}
              disabled={!canUpload}
              title={storage ? '选择本地图片上传' : '未配置图片存储，仅可手动填写链接'}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} />
              {uploading ? '上传中…' : '上传图片'}
            </button>
            <button type="button" className={actionBtnCls} onClick={addRow}>
              <Link2 size={14} />
              添加链接
            </button>
            {!storage ? (
              <span className="text-[11px] text-vl-text-muted">未配置图片存储，仅可手动填写图片链接</span>
            ) : null}
          </div>

          <div
            className={rowsCls}
            data-dragging={dragging}
            onDragOver={(event) => {
              event.preventDefault();
              if (storage) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            {rows.length === 0 ? (
              <div className="py-5 text-center text-[13px] text-vl-text-muted">
                暂无图片，点击「上传图片」或「添加链接」添加
              </div>
            ) : (
              rows.map((row, index) => (
                <div className={rowCls} key={index}>
                  <div className={thumbCls}>
                    {row.src ? (
                      <img src={row.src} alt={row.alt} />
                    ) : (
                      <ImageIcon size={18} />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <input
                      className={modalInput}
                      type="text"
                      value={row.src}
                      placeholder="图片地址（URL）"
                      onChange={(event) => updateRow(index, { src: event.target.value })}
                    />
                    <div className="flex gap-1.5">
                      <input
                        className={modalInput}
                        type="text"
                        value={row.alt}
                        placeholder="替代文本 alt"
                        onChange={(event) => updateRow(index, { alt: event.target.value })}
                      />
                      <input
                        className={modalInput}
                        type="text"
                        value={row.caption}
                        placeholder="说明文字（可选）"
                        onChange={(event) => updateRow(index, { caption: event.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-none flex-col gap-0.5">
                    <button
                      type="button"
                      className={opBtnCls}
                      aria-label="上移"
                      disabled={index === 0}
                      onClick={() => moveRow(index, -1)}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      className={opBtnCls}
                      aria-label="下移"
                      disabled={index === rows.length - 1}
                      onClick={() => moveRow(index, 1)}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      className={opDangerCls}
                      aria-label="删除"
                      onClick={() => removeRow(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {error ? <p className="px-3.5 pb-2.5 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
        </div>

        <div className={modalFooter}>
          <button type="button" className={modalBtn} onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className={modalBtn + ' ' + modalBtnPrimary}
            onClick={commit}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

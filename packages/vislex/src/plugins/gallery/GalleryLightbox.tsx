import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryImage } from './GalleryNode';

interface GalleryLightboxProps {
  images: GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/**
 * 图库灯箱：全屏查看单张图片。
 * - 遮罩点击 / Esc 关闭，← → 切换上一张 / 下一张；
 * - 底部展示序号与说明文字。
 */
const navBase =
  'absolute top-1/2 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-white/12 text-white hover:bg-white/25';
const navPrevCls = navBase + ' left-5';
const navNextCls = navBase + ' right-5';

export function GalleryLightbox({ images, index, onIndexChange, onClose }: GalleryLightboxProps) {
  const count = images.length;
  const current = images[index];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onIndexChange((index - 1 + count) % count);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onIndexChange((index + 1) % count);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, count, onIndexChange, onClose]);

  if (!current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-10 bg-black/80"
      onMouseDown={onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 bg-white/10 text-white hover:bg-white/20"
        aria-label="关闭"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={onClose}
      >
        <X size={20} />
      </button>

      {count > 1 ? (
        <>
          <button
            type="button"
            className={navPrevCls}
            aria-label="上一张"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onIndexChange((index - 1 + count) % count)}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            className={navNextCls}
            aria-label="下一张"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onIndexChange((index + 1) % count)}
          >
            <ChevronRight size={28} />
          </button>
        </>
      ) : null}

      <figure
        className="m-0 flex max-h-full max-w-full flex-col items-center gap-2.5"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <img
          className="block max-h-[78vh] max-w-[min(1100px,100%)] rounded-lg object-contain shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          src={current.src}
          alt={current.alt ?? ''}
        />
        <figcaption className="flex items-baseline gap-3 text-[13px] text-white/90">
          {current.caption ? <span className="text-white">{current.caption}</span> : null}
          <span className="text-xs text-white/60">
            {index + 1} / {count}
          </span>
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}

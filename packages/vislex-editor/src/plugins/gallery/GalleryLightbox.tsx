import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PortalThemeWrapper } from '@vislex/style-token';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import * as css from './GalleryLightbox.css';
import type { GalleryImage } from './GalleryNode.js';

interface GalleryLightboxProps {
  images: GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/**
 * 图库灯箱：全屏查看单张图片。
 * - 遮罩点击 / Esc 关闭，← → 切换上一张 / 下一张；
 * - 底部展示序号与说明文字；
 * - portal 到 body，内容包 PortalThemeWrapper 恢复 --vislex-* 变量。
 */
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
    <PortalThemeWrapper>
      <div className={css.backdrop} onMouseDown={onClose}>
        <button
          type="button"
          className={css.closeBtn}
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
              className={`${css.nav} ${css.navPrev}`}
              aria-label="上一张"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => onIndexChange((index - 1 + count) % count)}
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              className={`${css.nav} ${css.navNext}`}
              aria-label="下一张"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => onIndexChange((index + 1) % count)}
            >
              <ChevronRight size={28} />
            </button>
          </>
        ) : null}

        <figure className={css.figure} onMouseDown={(event) => event.stopPropagation()}>
          <img
            className={css.image}
            src={current.src}
            alt={current.alt ?? ''}
          />
          <figcaption className={css.caption}>
            {current.caption ? <span className={css.captionText}>{current.caption}</span> : null}
            <span className={css.counter}>
              {index + 1} / {count}
            </span>
          </figcaption>
        </figure>
      </div>
    </PortalThemeWrapper>,
    document.body,
  );
}

import type { GalleryImage, GalleryLayout, GalleryRendererProps } from '@vislex/editor/static';
import { useEffect, useRef, useState } from 'react';

import * as card from './card.css';
import * as css from './GalleryRenderer.css';
import { GalleryLightbox } from './GalleryLightbox.js';
import { ChevronLeftIcon, ChevronRightIcon, ImagePlusIcon, Maximize2Icon } from './icons.js';

const LAYOUT_LABEL: Record<GalleryLayout, string> = {
  grid: '网格',
  masonry: '瀑布流',
  carousel: '轮播',
};

/** 自动轮播间隔（毫秒） */
const AUTOPLAY_INTERVAL = 3000;

/** 各布局下图片项的类名组合（公共基类 + 布局变体） */
const ITEM_CLS: Record<GalleryLayout, string> = {
  grid: `${css.itemBase} ${css.gridItem}`,
  masonry: `${css.itemBase} ${css.masonryItem}`,
  carousel: `${css.itemBase} ${css.slide}`,
};

/** grid / masonry 布局的容器类（静态映射） */
const CONTAINER_CLS: Record<'grid' | 'masonry', string> = {
  grid: css.gridContainer,
  masonry: css.masonryContainer,
};

/**
 * 图库静态渲染器（RendererConfig 的 Gallery 槽位）。
 * - 三种布局：grid 等宽网格 / masonry 变高瀑布流 / carousel 横向轮播（自动播放，悬停暂停）；
 * - 点击任意图片打开灯箱（遮罩/Esc 关闭，← → 切换）；
 * - DOM 结构与编辑器内只读外观一致（blockWrap 对应 GalleryNode createDOM），无编辑按钮/模态/上传。
 */
export function GalleryRenderer({ layout, images }: GalleryRendererProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const count = images.length;

  // 轮播自动播放：悬停暂停、灯箱打开时暂停（避免与手动切换冲突）
  useEffect(() => {
    if (layout !== 'carousel' || hovered || lightboxIndex !== null || count <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % count);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [layout, hovered, lightboxIndex, count]);

  // 索引变化时把轨道滚动到对应页
  useEffect(() => {
    if (layout !== 'carousel') return;
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: slideIndex * track.clientWidth, behavior: 'smooth' });
  }, [layout, slideIndex]);

  // 图片数量变化时收敛索引，避免越界
  useEffect(() => {
    if (slideIndex >= count) setSlideIndex(0);
  }, [count, slideIndex]);

  const renderItem = (image: GalleryImage, index: number, className: string) => (
    <button
      key={`${image.src}-${index}`}
      type="button"
      className={className}
      title={image.caption || image.alt || image.src}
      onClick={() => setLightboxIndex(index)}
    >
      <img src={image.src} alt={image.alt ?? ''} loading="lazy" />
      {image.caption ? <span className={css.itemCaption}>{image.caption}</span> : null}
    </button>
  );

  const renderBody = () => {
    if (count === 0) {
      return (
        <div className={css.empty}>
          <ImagePlusIcon size={22} />
          <span>暂无图片</span>
        </div>
      );
    }

    if (layout === 'carousel') {
      return (
        <div
          className={`group/block ${css.carouselRoot}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className={css.track} ref={trackRef}>
            {images.map((image, index) => renderItem(image, index, ITEM_CLS.carousel))}
          </div>
          {count > 1 ? (
            <>
              <button
                type="button"
                className={`${css.arrow} ${css.arrowPrev}`}
                aria-label="上一张"
                onClick={() => setSlideIndex((slideIndex - 1 + count) % count)}
              >
                <ChevronLeftIcon size={20} />
              </button>
              <button
                type="button"
                className={`${css.arrow} ${css.arrowNext}`}
                aria-label="下一张"
                onClick={() => setSlideIndex((slideIndex + 1) % count)}
              >
                <ChevronRightIcon size={20} />
              </button>
              <div className={css.dots}>
                {images.map((image, index) => (
                  <button
                    key={`dot-${image.src}-${index}`}
                    type="button"
                    className={css.dot}
                    aria-label={`第 ${index + 1} 张`}
                    data-active={index === slideIndex}
                    onClick={() => setSlideIndex(index)}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      );
    }

    return (
      <div className={CONTAINER_CLS[layout]}>
        {images.map((image, index) => renderItem(image, index, ITEM_CLS[layout]))}
      </div>
    );
  };

  return (
    <div className={card.blockWrap}>
      <div className={card.blockCard} data-layout={layout}>
        <div className={card.blockHeader}>
          <span className={card.blockLabel}>
            图库 · {LAYOUT_LABEL[layout]}
            <span className={css.countBadge}>{count} 张</span>
          </span>
          {count > 0 ? (
            <span className={css.hint}>
              <Maximize2Icon size={12} />
              点击图片查看大图
            </span>
          ) : null}
        </div>
        <div className={css.body}>{renderBody()}</div>

        {lightboxIndex !== null ? (
          <GalleryLightbox
            images={images}
            index={lightboxIndex}
            onIndexChange={setLightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        ) : null}
      </div>
    </div>
  );
}

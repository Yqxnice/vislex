import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { ChevronLeft, ChevronRight, ImagePlus, Maximize2 } from 'lucide-react';
import { blockCard, blockEditBtn, blockHeader, blockLabel } from '../../ui/classes.css';
import * as css from './GalleryComponent.css';
import { GalleryLightbox } from './GalleryLightbox.js';
import { $isGalleryNode, type GalleryImage, type GalleryLayout } from './GalleryNode.js';

// 编辑模态框按需加载，避免首屏体积膨胀
const GalleryModal = lazy(() => import('./GalleryModal.js').then((m) => ({ default: m.GalleryModal })));

interface GalleryComponentProps {
  nodeKey: string;
  layout: GalleryLayout;
  images: GalleryImage[];
  editable?: boolean;
}

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

/**
 * 图库静态渲染器（DecoratorNode 的 decorate 产物）。
 * - 三种布局：grid 等宽网格 / masonry 变高瀑布流 / carousel 横向轮播；
 * - 编辑模式下右上角叠加「编辑」按钮，新插入的空图库会自动打开编辑模态框；
 * - 点击任意图片打开灯箱（遮罩/Esc 关闭，← → 切换）。
 */
export function GalleryComponent({ nodeKey, layout, images, editable: editableProp }: GalleryComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [editorEditable, setEditable] = useState(() => editor.isEditable());
  // 插入空图库时自动进入编辑；已有内容则直接展示
  const [modalOpen, setModalOpen] = useState(() => editor.isEditable() && images.length === 0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => editor.registerEditableListener(setEditable), [editor]);

  const editable = editableProp ?? editorEditable;

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

  const handleSave = (nextLayout: GalleryLayout, nextImages: GalleryImage[]) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isGalleryNode(node)) {
        node.setLayout(nextLayout);
        node.setImages(nextImages);
      }
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const renderItem = (image: GalleryImage, index: number, className: string) => (
    <button
      key={`${image.src}-${index}`}
      type="button"
      className={className}
      title={image.caption || image.alt || image.src}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => openLightbox(index)}
    >
      <img src={image.src} alt={image.alt ?? ''} loading="lazy" />
      {image.caption ? <span className={css.itemCaption}>{image.caption}</span> : null}
    </button>
  );

  const renderBody = () => {
    if (count === 0) {
      return (
        <div className={css.empty}>
          <ImagePlus size={22} />
          <span>还没有图片，点击「编辑」添加</span>
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
            {images.map((image, index) =>
              renderItem(image, index, ITEM_CLS.carousel),
            )}
          </div>
          {count > 1 ? (
            <>
              <button
                type="button"
                className={`${css.arrow} ${css.arrowPrev}`}
                aria-label="上一张"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setSlideIndex((slideIndex - 1 + count) % count)}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className={`${css.arrow} ${css.arrowNext}`}
                aria-label="下一张"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setSlideIndex((slideIndex + 1) % count)}
              >
                <ChevronRight size={20} />
              </button>
              <div className={css.dots}>
                {images.map((image, index) => (
                  <button
                    key={`dot-${image.src}-${index}`}
                    type="button"
                    className={css.dot}
                    aria-label={`第 ${index + 1} 张`}
                    data-active={index === slideIndex}
                    onMouseDown={(event) => event.preventDefault()}
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
      <div className={layout === 'masonry' ? css.masonryContainer : css.gridContainer}>
        {images.map((image, index) =>
          renderItem(image, index, ITEM_CLS[layout]),
        )}
      </div>
    );
  };

  return (
    <div className={blockCard} data-node-key={nodeKey} data-layout={layout}>
      <div className={blockHeader}>
        <span className={blockLabel}>
          图库 · {LAYOUT_LABEL[layout]}
          <span className={css.countBadge}>
            {count} 张
          </span>
        </span>
        {editable ? (
          <button
            type="button"
            className={blockEditBtn}
            title="编辑图库"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setModalOpen(true)}
          >
            编辑
          </button>
        ) : count > 0 ? (
          <span className={css.hint}>
            <Maximize2 size={12} />
            点击图片查看大图
          </span>
        ) : null}
      </div>
      <div className={css.body}>{renderBody()}</div>

      {modalOpen ? (
        <Suspense fallback={null}>
          <GalleryModal
            initialLayout={layout}
            initialImages={images}
            onCancel={() => setModalOpen(false)}
            onSave={(nextLayout, nextImages) => {
              handleSave(nextLayout, nextImages);
              setModalOpen(false);
            }}
          />
        </Suspense>
      ) : null}

      {lightboxIndex !== null ? (
        <GalleryLightbox
          images={images}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </div>
  );
}

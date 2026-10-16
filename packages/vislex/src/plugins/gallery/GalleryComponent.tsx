import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { ChevronLeft, ChevronRight, ImagePlus, Maximize2 } from 'lucide-react';
import { blockCard, blockEditBtn, blockHeader, blockLabel } from '../../ui/classes';
import { GalleryLightbox } from './GalleryLightbox';
import { $isGalleryNode, type GalleryImage, type GalleryLayout } from './GalleryNode';

// 编辑模态框按需加载，避免首屏体积膨胀
const GalleryModal = lazy(() => import('./GalleryModal').then((m) => ({ default: m.GalleryModal })));

interface GalleryComponentProps {
  nodeKey: string;
  layout: GalleryLayout;
  images: GalleryImage[];
}

const LAYOUT_LABEL: Record<GalleryLayout, string> = {
  grid: '网格',
  masonry: '瀑布流',
  carousel: '轮播',
};

/** 自动轮播间隔（毫秒） */
const AUTOPLAY_INTERVAL = 3000;

/** 图片项 / 轮播页公共基类（按钮需显式复位边框/背景/内边距） */
const itemBase =
  'relative block w-full cursor-zoom-in overflow-hidden rounded-md border-0 bg-transparent p-0 [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:object-cover [&_img]:transition-transform hover:[&_img]:scale-[1.03]';
const gridItemCls = itemBase + ' [&_img]:aspect-4/3';
const masonryItemCls = itemBase + ' mb-2 break-inside-avoid';
const slideCls = itemBase + ' flex-none basis-full snap-start [&_img]:aspect-16/9';

const itemCaptionCls =
  'absolute inset-x-0 bottom-0 overflow-hidden bg-gradient-to-t from-black/65 to-transparent px-2 pt-3 pb-1.5 text-left text-[11px] text-ellipsis whitespace-nowrap text-white';

const arrowBase =
  'absolute top-1/2 z-[2] inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-black/40 p-0 text-white opacity-0 transition-[opacity,background-color] group-hover/block:opacity-100 hover:bg-black/60 focus-visible:opacity-100';
const arrowPrevCls = arrowBase + ' left-2';
const arrowNextCls = arrowBase + ' right-2';

const dotsCls = 'flex items-center justify-center gap-1.5 pt-2 pb-0.5';
const dotCls =
  'size-[7px] cursor-pointer rounded-full border-0 bg-vl-border-strong p-0 transition-[background-color,transform] data-[active=true]:scale-120 data-[active=true]:bg-vl-brand';

/**
 * 图库静态渲染器（DecoratorNode 的 decorate 产物）。
 * - 三种布局：grid 等宽网格 / masonry 变高瀑布流 / carousel 横向轮播；
 * - 编辑模式下右上角叠加「编辑」按钮，新插入的空图库会自动打开编辑模态框；
 * - 点击任意图片打开灯箱（遮罩/Esc 关闭，← → 切换）。
 */
export function GalleryComponent({ nodeKey, layout, images }: GalleryComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [editable, setEditable] = useState(() => editor.isEditable());
  // 插入空图库时自动进入编辑；已有内容则直接展示
  const [modalOpen, setModalOpen] = useState(() => editor.isEditable() && images.length === 0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => editor.registerEditableListener(setEditable), [editor]);

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
      {image.caption ? <span className={itemCaptionCls}>{image.caption}</span> : null}
    </button>
  );

  const renderBody = () => {
    if (count === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-7 text-[13px] italic text-vl-text-muted">
          <ImagePlus size={22} />
          <span>还没有图片，点击「编辑」添加</span>
        </div>
      );
    }

    if (layout === 'carousel') {
      return (
        <div
          className="group/block relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div
            className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            ref={trackRef}
          >
            {images.map((image, index) =>
              renderItem(image, index, slideCls),
            )}
          </div>
          {count > 1 ? (
            <>
              <button
                type="button"
                className={arrowPrevCls}
                aria-label="上一张"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setSlideIndex((slideIndex - 1 + count) % count)}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className={arrowNextCls}
                aria-label="下一张"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setSlideIndex((slideIndex + 1) % count)}
              >
                <ChevronRight size={20} />
              </button>
              <div className={dotsCls}>
                {images.map((image, index) => (
                  <button
                    key={`dot-${image.src}-${index}`}
                    type="button"
                    className={dotCls}
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
      <div
        className={
          layout === 'masonry'
            ? 'columns-3 gap-2 max-sm:columns-2'
            : 'grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2'
        }
      >
        {images.map((image, index) =>
          renderItem(image, index, layout === 'masonry' ? masonryItemCls : gridItemCls),
        )}
      </div>
    );
  };

  return (
    <div className={blockCard} data-node-key={nodeKey} data-layout={layout}>
      <div className={blockHeader}>
        <span className={blockLabel}>
          图库 · {LAYOUT_LABEL[layout]}
          <span className="rounded-full bg-vl-code-bg px-1.5 text-[11px] text-vl-text-muted">
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
          <span className="inline-flex items-center gap-1 text-[11px] text-vl-text-muted">
            <Maximize2 size={12} />
            点击图片查看大图
          </span>
        ) : null}
      </div>
      <div className="p-2.5">{renderBody()}</div>

      {modalOpen
        ? createPortal(
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
            </Suspense>,
            document.body,
          )
        : null}

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

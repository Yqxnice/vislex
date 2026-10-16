import type { VideoRendererProps } from '@vislex/editor/static';

import * as card from './card.css';
import * as css from './video.css';

/** Film 图标（lucide 同源内联 SVG，避免为单个图标引入图标库依赖） */
function FilmIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
  );
}

/**
 * 视频块静态渲染器（RendererConfig 的 Video 槽位）。
 * DOM 结构与编辑器静态外观一致：blockWrap > blockCard > 头部标签 + <video controls>，
 * 剥离全部编辑交互（编辑按钮/模态框/nodeKey）。
 */
export function VideoRenderer({ src, poster, title }: VideoRendererProps) {
  return (
    <div className={card.blockWrap}>
      <div className={card.blockCard}>
        <div className={card.blockHeader}>
          <span className={card.blockLabel}>
            <FilmIcon size={13} />
            视频{title ? ` · ${title}` : ''}
          </span>
        </div>
        <div className={css.stage}>
          {src ? (
            <video src={src} poster={poster} title={title} controls preload="metadata" />
          ) : (
            <div className={css.emptyBox}>
              <FilmIcon size={22} />
              <span>暂无视频</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

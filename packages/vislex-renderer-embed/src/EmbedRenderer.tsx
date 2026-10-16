import type { EmbedRendererProps } from '@vislex/editor/static';

import * as card from './card.css';
import * as css from './embed.css';

/** Frame 图标（lucide 同源内联 SVG，避免为单个图标引入图标库依赖） */
function FrameIcon({ size }: { size: number }) {
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
      <line x1="22" x2="2" y1="6" y2="6" />
      <line x1="22" x2="2" y1="18" y2="18" />
      <line x1="6" x2="6" y1="2" y2="22" />
      <line x1="18" x2="18" y1="2" y2="22" />
    </svg>
  );
}

/**
 * 嵌入块静态渲染器（RendererConfig 的 Embed 槽位）。
 * 沙箱化 <iframe>（禁表单提交/顶级导航，保留脚本/同源/弹层），16:9 比例容器 + 懒加载，
 * 与编辑器静态外观一致，剥离全部编辑交互（编辑按钮/模态框/nodeKey）。
 */
export function EmbedRenderer({ src, title }: EmbedRendererProps) {
  return (
    <div className={card.blockWrap}>
      <div className={card.blockCard}>
        <div className={card.blockHeader}>
          <span className={card.blockLabel}>
            <FrameIcon size={13} />
            嵌入{title ? ` · ${title}` : ''}
          </span>
        </div>
        <div className={css.ratioBox}>
          {src ? (
            <iframe
              src={src}
              title={title || '嵌入内容'}
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              allow="fullscreen; picture-in-picture"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ) : (
            <div className={css.emptyOverlay}>
              <FrameIcon size={22} />
              <span>暂无嵌入内容</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

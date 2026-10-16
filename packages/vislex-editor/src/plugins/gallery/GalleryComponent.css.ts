/** 图库块静态渲染样式：grid / masonry / carousel 三种布局 + 悬停箭头 + 指示点 */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

/** 图片项 / 轮播页公共基类（按钮需显式复位边框/背景/内边距） */
export const itemBase = style({
  position: 'relative',
  display: 'block',
  width: '100%',
  cursor: 'zoom-in',
  overflow: 'hidden',
  borderRadius: vars.radius.sm,
  border: 0,
  backgroundColor: 'transparent',
  padding: 0,
});

globalStyle(`${itemBase} img`, {
  display: 'block',
  width: '100%',
  height: 'auto',
  objectFit: 'cover',
  transition: 'transform 150ms ease',
});

globalStyle(`${itemBase}:hover img`, {
  transform: 'scale(1.03)',
});

export const gridItem = style({});

globalStyle(`${gridItem} img`, {
  aspectRatio: '4 / 3',
});

export const masonryItem = style({
  marginBottom: vars.space.sm,
  breakInside: 'avoid',
});

export const slide = style({
  flex: 'none',
  flexBasis: '100%',
  scrollSnapAlign: 'start',
});

globalStyle(`${slide} img`, {
  aspectRatio: '16 / 9',
});

/** 图片说明条（底部渐变蒙层） */
export const itemCaption = style({
  position: 'absolute',
  right: 0,
  bottom: 0,
  left: 0,
  overflow: 'hidden',
  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.65), transparent)',
  padding: '12px 8px 6px',
  fontSize: '11px',
  color: '#ffffff',
  textAlign: 'left',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/** 空图库占位 */
export const empty = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '28px 12px',
  fontSize: vars.font.sizeSm,
  fontStyle: 'italic',
  color: vars.color.textMuted,
});

/** 头部「N 张」计数徽标 */
export const countBadge = style({
  borderRadius: '9999px',
  backgroundColor: vars.color.codeBg,
  padding: '0 6px',
  fontSize: '11px',
  color: vars.color.textMuted,
});

/** 只读态头部右侧提示 */
export const hint = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  fontSize: '11px',
  color: vars.color.textMuted,
});

export const body = style({
  padding: '10px',
});

/** 轮播容器（箭头定位基准） */
export const carouselRoot = style({
  position: 'relative',
});

/** 轮播轨道：横向滚动 + 吸附，隐藏滚动条 */
export const track = style({
  display: 'flex',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  scrollbarWidth: 'none',
});

globalStyle(`${track}::-webkit-scrollbar`, {
  display: 'none',
});

/** 轮播左右箭头：默认透明，父级 group/block 悬停或自身聚焦时浮现 */
export const arrow = style({
  position: 'absolute',
  top: '50%',
  zIndex: 2,
  display: 'inline-flex',
  width: '32px',
  height: '32px',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  border: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  padding: 0,
  color: '#ffffff',
  opacity: 0,
  transform: 'translateY(-50%)',
  transition: 'opacity 150ms ease, background-color 150ms ease',
  selectors: {
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    '&:focus-visible': {
      opacity: 1,
    },
  },
});

globalStyle(`.group\\/block:hover ${arrow}`, {
  opacity: 1,
});

export const arrowPrev = style({
  left: vars.space.sm,
});

export const arrowNext = style({
  right: vars.space.sm,
});

export const dots = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  paddingTop: vars.space.sm,
  paddingBottom: '2px',
});

export const dot = style({
  width: '7px',
  height: '7px',
  cursor: 'pointer',
  borderRadius: '9999px',
  border: 0,
  backgroundColor: vars.color.borderStrong,
  padding: 0,
  transition: 'background-color 150ms ease, transform 150ms ease',
  selectors: {
    '&[data-active="true"]': {
      backgroundColor: vars.color.brand,
      transform: 'scale(1.2)',
    },
  },
});

/** 瀑布流：3 列，窄屏（max-sm）2 列 */
export const masonryContainer = style({
  columns: 3,
  columnGap: vars.space.sm,
  '@media': {
    '(width < 40rem)': {
      columns: 2,
    },
  },
});

/** 网格：150px 最小列宽自动填充 */
export const gridContainer = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: vars.space.sm,
});

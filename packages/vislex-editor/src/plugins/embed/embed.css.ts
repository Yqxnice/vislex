/** 嵌入块与编辑模态的局部样式（颜色走 style-token vars，暗色由 .dark 祖先类翻转） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

/** 头部常驻「编辑」按钮（不随 hover 浮现，区别于共享 blockEditBtn） */
export const editBtn = style({
  flexShrink: 0,
  cursor: 'pointer',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderStrong}`,
  backgroundColor: vars.color.surface,
  padding: '2px 8px',
  fontSize: vars.font.sizeXs,
  color: vars.color.textMuted,
  selectors: {
    '&:hover': {
      borderColor: vars.color.brand,
      color: vars.color.brand,
    },
  },
});

/** 16:9 比例容器，iframe 绝对铺满 */
export const ratioBox = style({
  position: 'relative',
  paddingTop: '56.25%',
});

globalStyle(`${ratioBox} iframe`, {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  border: 0,
  backgroundColor: vars.color.codeBg,
});

/** 空嵌入占位（覆盖在比例容器上） */
export const emptyOverlay = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: vars.font.sizeSm,
  color: vars.color.textMuted,
});

/** 模态框表单主体 */
export const formBody = style({
  display: 'flex',
  width: 'min(520px, 100%)',
  minWidth: '380px',
  flexDirection: 'column',
  gap: '10px',
  padding: '12px 14px',
});

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xs,
});

export const fieldLabel = style({
  userSelect: 'none',
  fontSize: vars.font.sizeXs,
  color: vars.color.textMuted,
});

export const hint = style({
  fontSize: vars.font.sizeXs,
  color: vars.color.textMuted,
});

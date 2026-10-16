/** 视频块与编辑模态的局部样式（颜色走 style-token vars，暗色由 .dark 祖先类翻转） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, keyframes, style } from '@vanilla-extract/css';

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

/** 视频舞台容器：居中，子 video 限高 */
export const stage = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

globalStyle(`${stage} video`, {
  display: 'block',
  maxHeight: '420px',
  width: '100%',
  backgroundColor: '#000000',
});

/** 空视频占位（点击打开编辑） */
export const emptyBox = style({
  width: '100%',
  cursor: 'pointer',
  borderRadius: '8px',
  border: `1px dashed ${vars.color.border}`,
  backgroundColor: vars.color.surfaceMuted,
  padding: '28px 12px',
  textAlign: 'center',
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

export const uploadBtn = style({
  display: 'inline-flex',
  cursor: 'pointer',
  alignItems: 'center',
  gap: '6px',
  alignSelf: 'flex-start',
  borderRadius: vars.radius.sm,
  border: `1px dashed ${vars.color.borderStrong}`,
  backgroundColor: 'transparent',
  padding: '5px 10px',
  fontSize: vars.font.sizeXs,
  color: vars.color.textMuted,
  selectors: {
    '&:hover': {
      borderColor: vars.color.brand,
      color: vars.color.brand,
    },
    '&[data-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

export const spinner = style({
  animation: `${spin} 1s linear infinite`,
});

export const errorText = style({
  fontSize: vars.font.sizeXs,
  color: '#ef4444',
  selectors: {
    '.dark &': {
      color: '#f87171',
    },
  },
});

export const hint = style({
  fontSize: vars.font.sizeXs,
  color: vars.color.textMuted,
});

/** 模态框内视频预览容器 */
export const previewWrap = style({
  overflow: 'hidden',
  borderRadius: '8px',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: '#000000',
});

globalStyle(`${previewWrap} video`, {
  display: 'block',
  maxHeight: '220px',
  width: '100%',
});

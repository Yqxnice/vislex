/** Mermaid 块与源码编辑模态的局部样式（颜色走 style-token vars，暗色由 .dark 祖先类翻转） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

/** 双引擎产出的 SVG 统一限宽，避免撑破编辑区 */
export const canvas = style({});

globalStyle(`${canvas} svg`, {
  display: 'block',
  height: 'auto',
  maxWidth: '100%',
  margin: '0 auto',
});

/** 状态文案（空图表 / 渲染中） */
export const muted = style({
  fontSize: vars.font.sizeSm,
  fontStyle: 'italic',
  color: vars.color.textMuted,
});

export const errorMsg = style({
  fontSize: vars.font.sizeSm,
  color: '#dc2626',
  selectors: {
    '.dark &': {
      color: '#f87171',
    },
  },
});

/** 渲染失败时回显的源码块 */
export const errorPre = style({
  marginTop: vars.space.sm,
  overflowX: 'auto',
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.codeBg,
  padding: `10px ${vars.space.md}`,
  fontFamily: vars.font.mono,
  fontSize: vars.font.sizeXs,
  lineHeight: 1.6,
  whiteSpace: 'pre',
  color: vars.color.text,
});

/** 卡片正文容器（横向可滚动） */
export const body = style({
  overflowX: 'auto',
  padding: vars.space.md,
});

/** 模态框内源码输入框加高（叠加在共享 modalTextarea 上） */
export const codeTextarea = style({
  minHeight: '160px',
});

export const previewLabelRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: vars.space.sm,
  fontSize: vars.font.sizeXs,
  color: vars.color.textMuted,
});

export const previewLabelHint = style({
  fontSize: '11px',
  opacity: 0.8,
});

/** 预览区加高（叠加在共享 modalPreview 上） */
export const previewBox = style({
  minHeight: '120px',
});

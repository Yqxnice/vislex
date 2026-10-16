/** Mermaid 块静态渲染样式（与编辑器 mermaid.css 同源裁剪：去掉模态框样式；颜色走 style-token vars，暗色由 .dark 祖先类翻转） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

/** 双引擎产出的 SVG 统一限宽，避免撑破容器 */
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

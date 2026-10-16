/**
 * 代码块静态渲染样式 + shiki 双主题桥接全局样式。
 * .vislex-codeblock-html 为字面钩子类（shiki HTML 注入容器，见 CodeBlockComponent），
 * 暗色分支是 .dark 祖先类全局选择器（非 vars 翻转），必须保留。
 */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

/** 外层卡片在 blockCard 基础上的覆盖：代码底色 + relative 定位 */
export const codeCard = style({
  position: 'relative',
  backgroundColor: vars.color.codeBg,
});

/** 头部条底色（blockHeader 无背景，代码块头部用 muted 区分标签区与代码区） */
export const headerMuted = style({
  backgroundColor: vars.color.surfaceMuted,
});

/** 多文件标签页条 */
export const tabList = style({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  overflowX: 'auto',
});

export const tab = style({
  cursor: 'pointer',
  border: 0,
  borderBottom: '2px solid transparent',
  backgroundColor: 'transparent',
  padding: '6px 10px',
  fontFamily: vars.font.mono,
  fontSize: vars.font.sizeXs,
  whiteSpace: 'nowrap',
  color: vars.color.textMuted,
  selectors: {
    '&:hover': {
      color: vars.color.text,
    },
    '&[aria-selected="true"]': {
      borderBottomColor: vars.color.brand,
      color: vars.color.brand,
    },
  },
});

/** 单文件时的头部标签（等宽小字） */
export const singleLabel = style({
  userSelect: 'none',
  padding: '0 6px',
  fontFamily: vars.font.mono,
  fontSize: vars.font.sizeXs,
  color: vars.color.textMuted,
});

/** 代码区横向滚动容器 */
export const codeScroll = style({
  overflowX: 'auto',
});

/** 高亮未就绪时的纯文本回退（排版与 shiki 桥接保持一致） */
export const fallbackPre = style({
  margin: 0,
  overflowX: 'auto',
  padding: '12px 14px',
  fontFamily: vars.font.mono,
  fontSize: vars.font.sizeSm,
  lineHeight: 1.6,
  whiteSpace: 'pre',
  color: vars.color.text,
});

/* ---------- shiki 双主题桥接（全局样式，钩子类不变） ---------- */
/* shiki 输出颜色全部走 --shiki-light/--shiki-dark CSS 变量，.dark 祖先类切换 */

globalStyle('.vislex-codeblock-html pre.shiki', {
  margin: 0,
  padding: '12px 14px',
  background: 'var(--shiki-light-bg, transparent)',
  color: 'var(--shiki-light)',
  fontSize: vars.font.sizeSm,
  lineHeight: 1.6,
  overflowX: 'auto',
});

globalStyle('.vislex-codeblock-html pre.shiki code, .vislex-codeblock-html pre.shiki span', {
  fontFamily: vars.font.mono,
});

globalStyle('.vislex-codeblock-html pre.shiki span', {
  color: 'var(--shiki-light)',
});

globalStyle('.dark .vislex-codeblock-html pre.shiki', {
  background: 'var(--shiki-dark-bg, transparent)',
  color: 'var(--shiki-dark)',
});

globalStyle('.dark .vislex-codeblock-html pre.shiki span', {
  color: 'var(--shiki-dark)',
});

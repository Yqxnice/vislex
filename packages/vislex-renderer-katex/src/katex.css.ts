/** 数学公式静态渲染样式（与编辑器 math.css 同源裁剪：去掉编辑交互态） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

/** 块级公式外层（对应编辑器 BlockMathNode createDOM 的 nodeBlock） */
export const nodeBlock = style({
  display: 'block',
  margin: '12px 0',
});

/** 行内公式外层（对应编辑器 InlineMathNode createDOM 的 nodeInline） */
export const nodeInline = style({
  display: 'inline-block',
  verticalAlign: 'middle',
});

/** 块级公式卡片 */
export const block = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.space.sm,
  overflowX: 'auto',
  borderRadius: '8px',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surfaceMuted,
  padding: `12px 14px`,
});

/** 块级公式内容区（KaTeX 输出） */
export const blockContent = style({
  minWidth: 0,
  flex: 1,
  overflowX: 'auto',
});

globalStyle(`${blockContent} .katex-display`, {
  margin: 0,
});

/** 行内公式内容区 */
export const inline = style({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '4px',
  padding: '0 2px',
});

/** 空公式 / 渲染失败回退提示（renderMath 生成的 HTML 字符串使用） */
export const fallback = style({
  fontStyle: 'italic',
  color: vars.color.textMuted,
});

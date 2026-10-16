/** 数学公式插件样式（块级/行内渲染容器 + 模态框预览居中） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

/** BlockMathNode 容器（createDOM）：块级 + 上下间距 */
export const nodeBlock = style({
  display: 'block',
  margin: '12px 0',
});

/** InlineMathNode 容器（createDOM） */
export const nodeInline = style({
  display: 'inline-block',
  verticalAlign: 'middle',
});

const blockStyle = style({
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

/** 块级公式卡片（附带 group/block 字面类，供 blockEditBtn 的 hover 联动） */
export const block = `${blockStyle} group/block`;

/** 块级公式内容区（KaTeX 输出） */
export const blockContent = style({
  minWidth: 0,
  flex: 1,
  overflowX: 'auto',
});

globalStyle(`${blockContent} .katex-display`, {
  margin: 0,
});

/** 行内公式（点击编辑） */
export const inline = style({
  display: 'inline-flex',
  cursor: 'pointer',
  alignItems: 'center',
  borderRadius: '4px',
  padding: '0 2px',
  transition: 'background-color 150ms ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.surfaceMuted,
    },
  },
});

/** 空公式 / 渲染失败回退提示（katex.ts 生成的 HTML 字符串使用） */
export const fallback = style({
  fontStyle: 'italic',
  color: vars.color.textMuted,
});

/** 模态框预览区补充：块级公式时居中（与 modalPreview 叠加使用） */
export const preview = style({
  selectors: {
    '&[data-display-mode="true"]': {
      textAlign: 'center',
    },
  },
});

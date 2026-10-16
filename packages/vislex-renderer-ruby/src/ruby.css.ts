/** Ruby 注音静态渲染样式（与编辑器 ruby.css 同源裁剪：去掉编辑点击态与模态框件） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

/** RubyNode 容器（对应 RubyNode createDOM 的 nodeInline） */
export const nodeInline = style({
  display: 'inline-block',
  margin: '0 1px',
  verticalAlign: 'baseline',
});

/** 注音渲染根节点 */
export const root = style({});

globalStyle(`${root} rt`, {
  fontSize: '0.7em',
  userSelect: 'none',
  color: vars.color.textMuted,
});

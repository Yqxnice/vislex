/** Ruby 注音插件样式（节点容器 + 编辑模态框内容件） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

/** RubyNode 容器（createDOM） */
export const nodeInline = style({
  display: 'inline-block',
  margin: '0 1px',
  verticalAlign: 'baseline',
});

/** 注音渲染根节点（点击打开编辑模态框） */
export const root = style({
  cursor: 'pointer',
});

/** rt 注音小字（根节点与模态框预览共用） */
const rtStyle = {
  fontSize: '0.7em',
  userSelect: 'none',
  color: vars.color.textMuted,
} as const;

globalStyle(`${root} rt`, rtStyle);

/** 模态框主体（字段列布局，保持旧版最小宽度） */
export const modalBody = style({
  display: 'flex',
  minWidth: '380px',
  flexDirection: 'column',
  gap: '10px',
  padding: `12px 14px`,
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

/** 模态框实时预览框 */
export const preview = style({
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surfaceMuted,
  padding: `6px 10px`,
  fontSize: vars.font.sizeMd,
});

globalStyle(`${preview} rt`, rtStyle);

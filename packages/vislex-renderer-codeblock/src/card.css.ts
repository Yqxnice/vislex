/** 块级卡片骨架（与编辑器 ui/classes.css 的 blockWrap/blockCard/blockHeader 同源，去掉编辑按钮联动） */
import { vars } from '@vislex/style-token/styles';
import { style } from '@vanilla-extract/css';

/** 块级卡片外层包裹（块与正文的垂直间距，对应 CodeBlockNode createDOM 的 blockWrap） */
export const blockWrap = style({
  margin: '10px 0',
});

/** 块级卡片容器：边框 + 圆角 + muted 底色 */
export const blockCard = style({
  overflow: 'hidden',
  borderRadius: '8px',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surfaceMuted,
});

/** 块级卡片头部条 */
export const blockHeader = style({
  display: 'flex',
  minHeight: '32px',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.sm,
  borderBottom: `1px solid ${vars.color.border}`,
  paddingRight: vars.space.sm,
  paddingLeft: vars.space.md,
});

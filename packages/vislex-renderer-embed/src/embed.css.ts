/** 嵌入块静态渲染样式（与编辑器 embed.css 同源裁剪：去掉编辑按钮/模态框/空占位点击态） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

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
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: vars.font.sizeSm,
  color: vars.color.textMuted,
});

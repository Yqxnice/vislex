/** 视频块静态渲染样式（与编辑器 video.css 同源裁剪：去掉编辑按钮/模态框/空占位点击态） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

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

/** 空视频占位 */
export const emptyBox = style({
  width: '100%',
  borderRadius: '8px',
  border: `1px dashed ${vars.color.border}`,
  backgroundColor: vars.color.surfaceMuted,
  padding: '28px 12px',
  textAlign: 'center',
  fontSize: vars.font.sizeSm,
  color: vars.color.textMuted,
});

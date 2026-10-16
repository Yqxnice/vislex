/** 表格浮动操作条样式 */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const toolbar = style({
  position: 'absolute',
  zIndex: 30,
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  borderRadius: '8px',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  padding: '3px',
  boxShadow: vars.shadow.menu,
});

/** 按钮公共基类（通过 globalStyle 以 & button 下发，避免每个按钮重复类名） */
globalStyle(`${toolbar} button`, {
  cursor: 'pointer',
  borderRadius: '5px',
  border: 0,
  backgroundColor: 'transparent',
  padding: `3px 8px`,
  fontSize: vars.font.sizeXs,
  whiteSpace: 'nowrap',
  color: vars.color.text,
  transition: 'background-color 150ms ease, color 150ms ease',
});

globalStyle(`${toolbar} button:hover`, {
  backgroundColor: vars.color.codeBg,
});

/** 危险按钮类：删表格 */
export const danger = style({});

globalStyle(`${toolbar} ${danger}`, {
  color: '#ef4444',
});

globalStyle(`${toolbar} ${danger}:hover`, {
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
});

globalStyle(`.dark ${toolbar} ${danger}`, {
  color: '#f87171',
});

/** 斜杠菜单浮层样式（portal 挂载点脱离编辑器子树，由 PortalThemeWrapper 恢复变量） */
import { vars } from '@vislex/style-token/styles';
import { style } from '@vanilla-extract/css';

/** 浮层容器（定位坐标由 LexicalTypeaheadMenuPlugin 写到锚点元素上） */
export const menu = style({
  position: 'absolute',
  zIndex: 40,
  display: 'flex',
  maxHeight: '320px',
  minWidth: '220px',
  flexDirection: 'column',
  overflowY: 'auto',
  borderRadius: '8px',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  padding: vars.space.xs,
  boxShadow: vars.shadow.menu,
});

export const item = style({
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'center',
  gap: vars.space.sm,
  borderRadius: vars.radius.sm,
  border: 0,
  backgroundColor: 'transparent',
  padding: `6px ${vars.space.sm}`,
  fontSize: vars.font.sizeSm,
  color: vars.color.text,
  userSelect: 'none',
  selectors: {
    '&[data-active="true"]': {
      backgroundColor: vars.color.codeBg,
    },
  },
});

/** 左侧图标槽 */
export const itemIcon = style({
  display: 'inline-flex',
  height: '22px',
  width: '26px',
  flex: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '5px',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surfaceMuted,
  fontSize: '11px',
  color: vars.color.textMuted,
});

/** 图标槽内的字形（H1 / ✓ / ▦ 等） */
export const itemGlyph = style({
  fontFamily: vars.font.mono,
  fontSize: '11px',
});

export const itemTitle = style({
  minWidth: 0,
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

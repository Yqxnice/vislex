/** 拖拽块手柄与落点指示线样式（portal 内容由 PortalThemeWrapper 恢复变量） */
import { vars } from '@vislex/style-token/styles';
import { style } from '@vanilla-extract/css';

/** ⠿ 拖拽手柄（定位由 DraggableBlockPlugin 写行内 style） */
export const handle = style({
  position: 'absolute',
  zIndex: 30,
  display: 'flex',
  height: '24px',
  width: '20px',
  cursor: 'grab',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '5px',
  border: 0,
  backgroundColor: 'transparent',
  color: vars.color.textMuted,
  userSelect: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.codeBg,
      color: vars.color.text,
    },
    '&:active': {
      cursor: 'grabbing',
    },
  },
});

/** 落点指示线 */
export const targetLine = style({
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 30,
  height: '4px',
  borderRadius: '2px',
  backgroundColor: vars.color.brand,
});

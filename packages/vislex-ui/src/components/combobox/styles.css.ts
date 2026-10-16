import { vars } from '@vislex/style-token/styles';
import { style } from '@vanilla-extract/css';

import { applyItemSvgStyles, itemBase, popupBase } from '../../styles/menu.css';

export const popup = style({
  ...popupBase,
  maxHeight: 'min(var(--available-height), 16rem)',
});

export const positioner = style({
  outline: 'none',
  zIndex: 50,
});

export const item = style(itemBase);

applyItemSvgStyles(item);

export const empty = style({
  padding: `${vars.space.sm} ${vars.space.md}`,
  fontSize: vars.font.sizeSm,
  color: vars.color.textMuted,
  textAlign: 'center',
});

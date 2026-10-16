import { vars } from '@vislex/style-token/styles';
import type { StyleRule } from '@vanilla-extract/css';
import { globalStyle, keyframes, style } from '@vanilla-extract/css';

const popupIn = keyframes({
  from: { opacity: 0, transform: 'scale(0.95)' },
  to: { opacity: 1, transform: 'scale(1)' },
});

const popupOut = keyframes({
  from: { opacity: 1, transform: 'scale(1)' },
  to: { opacity: 0, transform: 'scale(0.95)' },
});

export const popupBase: StyleRule = {
  minWidth: '8rem',
  borderRadius: vars.radius.md,
  padding: vars.space.xs,
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  boxShadow: vars.shadow.menu,
  outline: 'none',
  color: vars.color.text,
  fontFamily: vars.font.sans,
  fontSize: vars.font.sizeSm,
  zIndex: 50,
  maxHeight: 'var(--available-height)',
  overflowX: 'hidden',
  overflowY: 'auto',
  transformOrigin: 'var(--transform-origin)',
  transition: 'opacity 100ms ease-out, transform 100ms ease-out',
  selectors: {
    '&[data-open]': {
      animation: `${popupIn} 100ms ease-out`,
    },
    '&[data-starting-style]': {
      opacity: 0,
      transform: 'scale(0.95)',
    },
    '&[data-ending-style]': {
      opacity: 0,
      transform: 'scale(0.95)',
    },
    '&[data-closed]': {
      animation: `${popupOut} 100ms ease-in`,
      overflow: 'hidden',
    },
  },
};

export const itemBase: StyleRule = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.sm,
  padding: `${vars.space.xs} ${vars.space.md} ${vars.space.xs} ${vars.space.sm}`,
  fontSize: vars.font.sizeSm,
  lineHeight: 1.35,
  outline: 'none',
  userSelect: 'none',
  cursor: 'default',
  color: vars.color.text,
  position: 'relative',
  transition: 'background-color 100ms ease, color 100ms ease',
  selectors: {
    '&[data-highlighted]': {
      backgroundColor: vars.color.surfaceMuted,
      color: vars.color.text,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      pointerEvents: 'none',
    },
  },
};

export function applyItemSvgStyles(itemClass: string) {
  globalStyle(`${itemClass} svg`, {
    pointerEvents: 'none',
    flexShrink: 0,
    width: '16px',
    height: '16px',
    color: vars.color.textMuted,
    transition: 'color 100ms ease',
  });

  globalStyle(`${itemClass}[data-highlighted] svg`, {
    color: vars.color.text,
  });
}

export const separator = style({
  height: '1px',
  backgroundColor: vars.color.border,
  margin: `${vars.space.xs} calc(-1 * ${vars.space.xs})`,
});

export const label = style({
  fontSize: vars.font.sizeXs,
  fontWeight: 500,
  lineHeight: 1.4,
  color: vars.color.textMuted,
  padding: `${vars.space.xs} 6px`,
});

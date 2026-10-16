import { vars } from '@vislex/style-token/styles';
import { globalStyle, keyframes, style } from '@vanilla-extract/css';

const popoverIn = keyframes({
  from: { opacity: 0, transform: 'translateY(2px) scale(0.96)' },
  to: { opacity: 1, transform: 'translateY(0) scale(1)' },
});

const popoverOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0) scale(1)' },
  to: { opacity: 0, transform: 'translateY(2px) scale(0.96)' },
});

export const popup = style({
  zIndex: 50,
  width: 288,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  padding: vars.space.lg,
  backgroundColor: vars.color.surface,
  boxShadow: vars.shadow.modal,
  outline: 'none',
  transition: 'opacity 150ms ease-out, transform 150ms ease-out',
  fontFamily: vars.font.sans,
  fontSize: vars.font.sizeMd,
  color: vars.color.text,
  selectors: {
    '&[data-open]': {
      animation: `${popoverIn} 150ms ease-out`,
    },
    '&[data-ending-style]': {
      opacity: 0,
      transform: 'translateY(2px) scale(0.96)',
    },
    '&[data-closed]': {
      animation: `${popoverOut} 150ms ease-in`,
    },
  },
});

export const arrow = style({
  width: 10,
  height: 10,
  transformOrigin: 'center',
});

globalStyle(`${arrow} > polygon`, {
  fill: vars.color.surface,
});

globalStyle(`${arrow} > polyline`, {
  stroke: vars.color.border,
  fill: 'none',
});

export const title = style({
  fontSize: vars.font.sizeMd,
  fontWeight: 600,
  lineHeight: 1,
  color: vars.color.text,
});

export const description = style({
  fontSize: vars.font.sizeSm,
  lineHeight: 1.4,
  color: vars.color.textMuted,
  marginTop: vars.space.xs,
});

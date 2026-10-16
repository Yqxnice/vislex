import { vars } from '@vislex/style-token/styles';
import { keyframes, style } from '@vanilla-extract/css';

const tooltipIn = keyframes({
  from: { opacity: 0, transform: 'translateY(2px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

const tooltipOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0)' },
  to: { opacity: 0, transform: 'translateY(2px)' },
});

export const positioner = style({
  zIndex: 50,
  outline: 'none',
});

export const popup = style({
  maxWidth: 320,
  padding: `${vars.space.xs} ${vars.space.sm}`,
  fontSize: vars.font.sizeXs,
  lineHeight: 1.4,
  fontFamily: vars.font.sans,
  color: vars.color.text,
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  boxShadow: vars.shadow.menu,
  outline: 'none',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  pointerEvents: 'none',
  transition: 'opacity 120ms ease-out, transform 120ms ease-out',
  selectors: {
    '&[data-open]': {
      animation: `${tooltipIn} 120ms ease-out`,
    },
    '&[data-ending-style]': {
      opacity: 0,
      transform: 'translateY(2px)',
    },
    '&[data-closed]': {
      animation: `${tooltipOut} 120ms ease-in`,
    },
  },
});

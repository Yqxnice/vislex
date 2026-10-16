import { vars } from '@vislex/style-token/styles';
import { globalStyle, keyframes, style } from '@vanilla-extract/css';

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const fadeOut = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

const contentIn = keyframes({
  from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.95)' },
  to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

const contentOut = keyframes({
  from: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
  to: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.95)' },
});

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  selectors: {
    '&[data-open]': {
      animation: `${fadeIn} 250ms ease-out`,
    },
    '&[data-closed]': {
      animation: `${fadeOut} 200ms ease-in`,
    },
  },
});

export const popup = style({
  'position': 'fixed',
  'top': '50%',
  'left': '50%',
  'transform': 'translate(-50%, -50%)',
  'zIndex': 50,
  'display': 'grid',
  'width': '100%',
  'maxWidth': 'calc(100% - 2rem)',
  'gap': 0,
  'borderRadius': vars.radius.lg,
  'border': `1px solid ${vars.color.border}`,
  'padding': 0,
  'fontFamily': vars.font.sans,
  'fontSize': vars.font.sizeMd,
  'lineHeight': '1.5',
  'color': vars.color.text,
  'backgroundColor': vars.color.surface,
  'boxShadow': vars.shadow.modal,
  'outline': 'none',
  'selectors': {
    '&[data-open]': {
      animation: `${contentIn} 150ms ease-out`,
    },
    '&[data-closed]': {
      animation: `${contentOut} 100ms ease-in`,
    },
  },
  '@media': {
    '(min-width: 640px)': {
      maxWidth: '28rem',
    },
  },
});

export const closeButton = style({
  'position': 'absolute',
  'top': '16px',
  'right': '16px',
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 24,
  'height': 24,
  'borderRadius': vars.radius.sm,
  'border': 'none',
  'background': 'none',
  'cursor': 'pointer',
  'opacity': 0.7,
  'color': vars.color.textMuted,
  'transition': 'opacity 0.2s ease, color 0.2s ease',
  ':hover': {
    opacity: 1,
    color: vars.color.text,
  },
  ':focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${vars.color.surface}, 0 0 0 4px ${vars.color.brand}`,
  },
  'selectors': {
    '&:disabled': {
      pointerEvents: 'none',
      opacity: 0.5,
    },
  },
});

globalStyle(`${closeButton} svg`, {
  width: 16,
  height: 16,
  pointerEvents: 'none',
  flexShrink: 0,
});

export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  padding: `${vars.space.xl} ${vars.space.xl} 0`,
});

export const footer = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: vars.space.sm,
  padding: `${vars.space.lg} ${vars.space.xl} ${vars.space.xl}`,
});

export const title = style({
  fontFamily: vars.font.sans,
  fontSize: vars.font.sizeLg,
  fontWeight: 600,
  lineHeight: '1.4',
  color: vars.color.text,
});

export const description = style({
  fontFamily: vars.font.sans,
  fontSize: vars.font.sizeMd,
  lineHeight: '1.5',
  color: vars.color.textMuted,
});

/** 工具栏样式（下拉箭头 data-URI 由原 styles.css 的 .vislex-tb-select-bg 迁入） */
import { vars } from '@vislex/style-token/styles';
import { style } from '@vanilla-extract/css';

export const toolbar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '2px',
  borderBottom: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surfaceMuted,
  padding: '6px 8px',
});

export const separator = style({
  margin: '0 6px',
  height: '18px',
  width: '1px',
  backgroundColor: vars.color.borderStrong,
});

export const select = style({
  height: '28px',
  cursor: 'pointer',
  appearance: 'none',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderStrong}`,
  backgroundColor: vars.color.surface,
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%239ca3af' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
  paddingRight: '24px',
  paddingLeft: vars.space.sm,
  fontSize: vars.font.sizeSm,
  lineHeight: 1,
  color: vars.color.text,
  transition: 'border-color 150ms ease, color 150ms ease',
  selectors: {
    '&:hover:not(:disabled)': {
      borderColor: vars.color.brand,
      color: vars.color.brand,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});

export const button = style({
  display: 'inline-flex',
  height: '28px',
  minWidth: '28px',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.sm,
  border: 0,
  backgroundColor: 'transparent',
  padding: '0 6px',
  fontSize: vars.font.sizeSm,
  lineHeight: 1,
  color: vars.color.textMuted,
  transition: 'background-color 150ms ease, color 150ms ease',
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: vars.color.codeBg,
      color: vars.color.text,
    },
    '&[aria-pressed="true"]': {
      backgroundColor: vars.color.codeBg,
      color: vars.color.brand,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});

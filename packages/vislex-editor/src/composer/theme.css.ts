/** Lexical 基础主题的 VE 类名（theme.ts 引用，暗色靠 vars 翻转，不写变体） */
import { vars } from '@vislex/style-token/styles';
import { style } from '@vanilla-extract/css';

export const paragraph = style({
  marginBottom: vars.space.sm,
  selectors: {
    '&:last-child': {
      marginBottom: 0,
    },
  },
});

export const headingH1 = style({
  margin: '18px 0 10px',
  fontSize: '1.5em',
  lineHeight: 1.35,
  fontWeight: 600,
});

export const headingH2 = style({
  margin: '16px 0 8px',
  fontSize: '1.25em',
  lineHeight: 1.4,
  fontWeight: 600,
});

export const headingH3 = style({
  margin: '14px 0 8px',
  fontSize: '1.1em',
  fontWeight: 600,
});

export const quote = style({
  margin: '10px 0',
  borderLeft: `3px solid ${vars.color.borderStrong}`,
  paddingLeft: vars.space.md,
  color: vars.color.textMuted,
});

export const listUl = style({
  margin: '8px 0',
  listStyleType: 'disc',
  paddingLeft: '22px',
});

export const listOl = style({
  margin: '8px 0',
  listStyleType: 'decimal',
  paddingLeft: '22px',
});

export const listitem = style({
  margin: '2px 0',
});

export const textBold = style({
  fontWeight: 600,
});

export const textItalic = style({
  fontStyle: 'italic',
});

export const textStrikethrough = style({
  textDecoration: 'line-through',
});

export const textCode = style({
  borderRadius: '4px',
  backgroundColor: vars.color.codeBg,
  padding: '1px 5px',
  fontFamily: vars.font.mono,
  fontSize: '0.9em',
});

export const link = style({
  cursor: 'pointer',
  color: vars.color.brand,
  textDecoration: 'underline',
});

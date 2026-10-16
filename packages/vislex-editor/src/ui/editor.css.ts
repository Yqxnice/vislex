/** 编辑器外壳与输入区样式（vislex-root / vislex-body 钩子类保留在 TSX 侧） */
import { vars } from '@vislex/style-token/styles';
import { style } from '@vanilla-extract/css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  color: vars.color.text,
  transition: 'border-color 150ms ease',
  selectors: {
    '&:focus-within': {
      borderColor: vars.color.brand,
    },
  },
});

export const body = style({
  position: 'relative',
  flex: 1,
});

export const contentEditable = style({
  minHeight: '220px',
  padding: '14px 16px',
  fontSize: vars.font.sizeMd,
  lineHeight: 1.75,
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  outline: 'none',
  selectors: {
    "&[contenteditable='false']": {
      backgroundColor: vars.color.surfaceMuted,
      color: vars.color.textMuted,
    },
  },
});

export const placeholder = style({
  pointerEvents: 'none',
  position: 'absolute',
  top: '14px',
  left: '16px',
  fontSize: vars.font.sizeMd,
  color: vars.color.textMuted,
  userSelect: 'none',
});

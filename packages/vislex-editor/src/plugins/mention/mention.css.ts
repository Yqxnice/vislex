/** Mention（@提及）插件样式（节点高亮 + 编辑弹层内容件） */
import { vars } from '@vislex/style-token/styles';
import { style } from '@vanilla-extract/css';

/** MentionNode 行内高亮（createDOM） */
export const node = style({
  borderRadius: '4px',
  backgroundColor: vars.color.codeBg,
  padding: '1px 4px',
  fontWeight: 500,
  color: vars.color.brand,
});

/** 弹层主体（字段列布局，保持旧版最小宽度） */
export const modalBody = style({
  display: 'flex',
  minWidth: '380px',
  flexDirection: 'column',
  gap: '10px',
  padding: `12px 14px`,
});

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xs,
});

export const fieldLabel = style({
  userSelect: 'none',
  fontSize: vars.font.sizeXs,
  color: vars.color.textMuted,
});

/** 删除按钮（危险色，左对齐） */
export const deleteBtn = style({
  cursor: 'pointer',
  alignSelf: 'flex-start',
  borderRadius: vars.radius.sm,
  border: '1px solid rgba(239, 68, 68, 0.5)',
  backgroundColor: 'transparent',
  padding: `4px 10px`,
  fontSize: vars.font.sizeXs,
  color: '#ef4444',
  selectors: {
    '&:hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
    },
  },
});

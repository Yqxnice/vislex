/** 图库编辑模态框内容样式（模态壳由 ui/EditorModal 承担） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

/** 弹窗主体：撑满 DialogPopup 剩余高度并纵向滚动 */
export const body = style({
  display: 'flex',
  minHeight: 0,
  flex: 1,
  flexDirection: 'column',
  overflow: 'auto',
});

/** 顶部布局切换条 */
export const tabsBar = style({
  display: 'flex',
  gap: vars.space.xs,
  borderBottom: `1px solid ${vars.color.border}`,
  padding: '10px 14px',
});

/** 布局切换按钮（aria-selected 为选中态） */
export const layoutBtn = style({
  cursor: 'pointer',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderStrong}`,
  backgroundColor: vars.color.surface,
  padding: '5px 14px',
  fontSize: vars.font.sizeSm,
  color: vars.color.textMuted,
  selectors: {
    '&:hover': {
      color: vars.color.text,
    },
    '&[aria-selected="true"]': {
      borderColor: vars.color.brand,
      backgroundColor: vars.color.brand,
      color: '#ffffff',
    },
  },
});

/** 上传 / 添加链接工具条 */
export const toolbar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.space.sm,
  borderBottom: `1px solid ${vars.color.border}`,
  padding: '10px 14px',
});

/** 工具条按钮（与共享 modalBtn 叠加：图标 + 文案横排） */
export const actionBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
});

export const storageHint = style({
  fontSize: '11px',
  color: vars.color.textMuted,
});

/** 图片行列表：拖拽悬停时显示虚线框 */
export const rows = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
  padding: '14px',
  selectors: {
    '&[data-dragging="true"]': {
      borderRadius: '8px',
      outline: `2px dashed ${vars.color.brand}`,
      outlineOffset: '-6px',
    },
  },
});

export const emptyRows = style({
  padding: '20px 0',
  fontSize: vars.font.sizeSm,
  color: vars.color.textMuted,
  textAlign: 'center',
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  borderRadius: '8px',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  padding: vars.space.sm,
});

export const thumb = style({
  display: 'flex',
  width: '48px',
  height: '48px',
  flex: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.codeBg,
  color: vars.color.textMuted,
});

globalStyle(`${thumb} img`, {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const rowFields = style({
  display: 'flex',
  minWidth: 0,
  flex: 1,
  flexDirection: 'column',
  gap: '6px',
});

export const rowFieldPair = style({
  display: 'flex',
  gap: '6px',
});

export const rowOps = style({
  display: 'flex',
  flex: 'none',
  flexDirection: 'column',
  gap: '2px',
});

export const opBtn = style({
  display: 'inline-flex',
  width: '24px',
  height: '22px',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  border: 0,
  backgroundColor: 'transparent',
  padding: 0,
  color: vars.color.textMuted,
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: vars.color.codeBg,
      color: vars.color.text,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.35,
    },
  },
});

/** 删除按钮：与 opBtn 叠加，hover 变红（定义在 opBtn 之后保证覆盖） */
export const opDanger = style({
  selectors: {
    '&:hover:not(:disabled)': {
      color: '#ef4444',
    },
  },
});

export const errorText = style({
  margin: 0,
  padding: '0 14px 10px',
  fontSize: vars.font.sizeXs,
  color: '#dc2626',
});

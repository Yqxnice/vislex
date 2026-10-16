/** 白板块静态渲染与画布样式（颜色走 style-token vars，暗色由 .dark 祖先类翻转） */
import { vars } from '@vislex/style-token/styles';
import { style } from '@vanilla-extract/css';

/**
 * 头部条：同共享 blockHeader，但主轴对齐为 flex-start
 *（共享 blockHeader 是 space-between，这里头部控件靠 ml-auto 右推，需起点对齐）
 */
export const header = style({
  display: 'flex',
  minHeight: '32px',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: vars.space.sm,
  borderBottom: `1px solid ${vars.color.border}`,
  paddingRight: vars.space.sm,
  paddingLeft: vars.space.md,
});

/** 头部存储策略下拉框 */
export const modeSelect = style({
  marginLeft: 'auto',
  cursor: 'pointer',
  appearance: 'none',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderStrong}`,
  backgroundColor: vars.color.surface,
  padding: `3px 6px`,
  fontSize: vars.font.sizeXs,
  lineHeight: 1.4,
  color: vars.color.textMuted,
});

/** 只读态头部策略说明 */
export const modeHint = style({
  marginLeft: 'auto',
  fontSize: '11px',
  color: vars.color.textMuted,
  opacity: 0.8,
});

/** 头部保存按钮 */
export const saveBtn = style({
  cursor: 'pointer',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderStrong}`,
  backgroundColor: vars.color.surface,
  padding: `3px 10px`,
  fontSize: vars.font.sizeXs,
  lineHeight: 1.4,
  color: vars.color.textMuted,
  transition: 'color 150ms ease, border-color 150ms ease, background-color 150ms ease',
  selectors: {
    '&:hover:enabled': {
      borderColor: vars.color.brand,
      color: vars.color.brand,
    },
    '&:disabled': {
      cursor: 'default',
      opacity: 0.55,
    },
  },
});

/** 画布容器（出错时高度自适应） */
export const body = style({
  height: '460px',
  selectors: {
    '&[data-state="error"]': {
      height: 'auto',
    },
  },
});

/** 加载 / 画布懒加载占位 */
export const placeholder = style({
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.space.md,
  fontSize: vars.font.sizeSm,
  fontStyle: 'italic',
  color: vars.color.textMuted,
});

/** 解析 / 加载失败提示 */
export const errorMsg = style({
  display: 'flex',
  height: 'auto',
  minHeight: '72px',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.space.md,
  textAlign: 'center',
  fontSize: vars.font.sizeSm,
  color: '#dc2626',
  selectors: {
    '.dark &': {
      color: '#f87171',
    },
  },
});

/** Excalidraw 画布撑满容器 */
export const canvasFull = style({
  width: '100%',
  height: '100%',
});

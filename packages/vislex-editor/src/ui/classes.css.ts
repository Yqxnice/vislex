/**
 * 通用 VE 样式：块级卡片骨架（代码块/图表/白板/图库/视频/嵌入共用）与模态框内容件。
 * 颜色一律走 style-token vars（--vislex-* 变量，暗色由 .dark 祖先类翻转变量值）。
 * 模态框外壳（遮罩/容器/关闭按钮）由 @vislex/ui Dialog 承担，见 ui/EditorModal.tsx。
 */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

/** hover 浮现编辑按钮（父容器需带 blockCard，其上有 group/block 字面类） */
export const blockEditBtn = style({
  cursor: 'pointer',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderStrong}`,
  backgroundColor: vars.color.surface,
  padding: `3px 10px`,
  fontSize: vars.font.sizeXs,
  lineHeight: 1.4,
  color: vars.color.textMuted,
  opacity: 0,
  transition: 'opacity 150ms ease, color 150ms ease, border-color 150ms ease',
  selectors: {
    '&:hover': {
      borderColor: vars.color.brand,
      color: vars.color.brand,
    },
    '&:focus-visible': {
      opacity: 1,
    },
  },
});

globalStyle(`.group\\/block:hover ${blockEditBtn}`, {
  opacity: 1,
});

/** 块级卡片外层包裹（块与正文的垂直间距） */
export const blockWrap = style({
  margin: '10px 0',
});

const blockCardStyle = style({
  overflow: 'hidden',
  borderRadius: '8px',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surfaceMuted,
});

/**
 * 块级卡片容器：边框 + 圆角 + muted 底色（代码块用 vars.color.codeBg，单独写）。
 * 附带 group/block 字面类，供 blockEditBtn 的 hover 联动选择器使用。
 */
export const blockCard = `${blockCardStyle} group/block`;

/** 块级卡片头部条 */
export const blockHeader = style({
  display: 'flex',
  minHeight: '32px',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.sm,
  borderBottom: `1px solid ${vars.color.border}`,
  paddingRight: vars.space.sm,
  paddingLeft: vars.space.md,
});

/** 块级卡片头部左侧标签（等宽小字） */
export const blockLabel = style({
  display: 'inline-flex',
  minWidth: 0,
  userSelect: 'none',
  alignItems: 'center',
  gap: '6px',
  fontFamily: vars.font.mono,
  fontSize: vars.font.sizeXs,
  color: vars.color.textMuted,
});

/**
 * 模态框容器布局覆盖：DialogPopup 默认 display:grid，编辑器模态统一改 flex 列。
 * 用 && 抬优先级，压过 @vislex/ui 的内置样式与 sm 断点 maxWidth（宽度由 EditorModal 行内 style 控制）。
 */
export const dialogPopup = style({
  selectors: {
    '&&': {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      maxHeight: 'min(720px, 100%)',
    },
  },
});

/** 模态框头部（覆盖 DialogHeader 默认的列布局与大 padding） */
export const modalHeader = style({
  selectors: {
    '&&': {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: vars.space.sm,
      borderBottom: `1px solid ${vars.color.border}`,
      padding: `10px 14px`,
    },
  },
});

/** 模态框标题（覆盖 DialogTitle 默认字号） */
export const modalTitle = style({
  selectors: {
    '&&': {
      fontSize: vars.font.sizeMd,
      fontWeight: 600,
    },
  },
});

/** 模态框底部按钮区（覆盖 DialogFooter 默认 padding） */
export const modalFooter = style({
  selectors: {
    '&&': {
      justifyContent: 'flex-end',
      gap: vars.space.sm,
      borderTop: `1px solid ${vars.color.border}`,
      padding: `10px 14px`,
    },
  },
});

/** 模态框字段区（多文件代码块顶部文件名/语言行） */
export const modalFields = style({
  display: 'flex',
  gap: vars.space.sm,
  borderBottom: `1px solid ${vars.color.border}`,
  padding: `10px 14px`,
});

export const modalInput = style({
  minWidth: 0,
  flex: 1,
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderStrong}`,
  backgroundColor: vars.color.surface,
  padding: `6px 10px`,
  fontFamily: vars.font.mono,
  fontSize: vars.font.sizeSm,
  color: vars.color.text,
  outline: 'none',
  selectors: {
    '&:focus': {
      borderColor: vars.color.brand,
    },
  },
});

export const modalBtn = style({
  cursor: 'pointer',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderStrong}`,
  backgroundColor: vars.color.surface,
  padding: `6px 16px`,
  fontSize: vars.font.sizeSm,
  color: vars.color.text,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.surfaceMuted,
    },
  },
});

/** 主按钮：与 modalBtn 叠加使用 */
export const modalBtnPrimary = style({
  borderColor: vars.color.brand,
  backgroundColor: vars.color.brand,
  color: '#ffffff',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.brand,
      filter: 'brightness(1.08)',
    },
  },
});

/** 模态框主体（flex 列 + 可滚动），数学/图表等弹窗共用 */
export const modalBody = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: '10px',
  overflow: 'auto',
  padding: '14px',
});

/** 模态框内多行源码输入框（等宽、可纵向拉伸） */
export const modalTextarea = style({
  minHeight: '80px',
  width: '100%',
  resize: 'vertical',
  borderRadius: '8px',
  border: `1px solid ${vars.color.borderStrong}`,
  backgroundColor: vars.color.surface,
  padding: `10px 12px`,
  fontFamily: vars.font.mono,
  fontSize: vars.font.sizeSm,
  lineHeight: 1.6,
  color: vars.color.text,
  outline: 'none',
  selectors: {
    '&:focus': {
      borderColor: vars.color.brand,
    },
  },
});

/** 预览区虚框容器 */
export const modalPreview = style({
  minHeight: '48px',
  overflowX: 'auto',
  borderRadius: '8px',
  border: `1px dashed ${vars.color.borderStrong}`,
  backgroundColor: vars.color.surfaceMuted,
  padding: `12px 14px`,
});

export const modalPreviewLabel = style({
  fontSize: vars.font.sizeXs,
  color: vars.color.textMuted,
});

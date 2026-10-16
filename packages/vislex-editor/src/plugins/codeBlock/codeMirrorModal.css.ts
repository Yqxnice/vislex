/** CodeMirror 多文件编辑模态的内容样式（模态壳走 EditorModal） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

/** 文件标签页条（贴 modalFields 上方，muted 底色） */
export const tabBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  overflowX: 'auto',
  borderBottom: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surfaceMuted,
  padding: '6px 10px 0',
});

/** 单个文件标签页（选中时上浮为 surface 底色，底边与下方内容区连通） */
export const tab = style({
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'center',
  gap: '4px',
  borderRadius: '8px 8px 0 0',
  border: '1px solid transparent',
  borderBottom: 0,
  padding: '6px 12px',
  fontFamily: vars.font.mono,
  fontSize: vars.font.sizeXs,
  whiteSpace: 'nowrap',
  color: vars.color.textMuted,
  userSelect: 'none',
  selectors: {
    '&:hover': {
      color: vars.color.text,
    },
    '&[aria-selected="true"]': {
      borderColor: vars.color.border,
      backgroundColor: vars.color.surface,
      color: vars.color.brand,
    },
  },
});

/** 标签页上的删除小按钮 */
export const tabClose = style({
  display: 'inline-flex',
  width: '18px',
  height: '18px',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  border: 0,
  backgroundColor: 'transparent',
  padding: 0,
  fontSize: vars.font.sizeSm,
  lineHeight: 1,
  color: vars.color.textMuted,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.codeBg,
      color: '#ef4444',
    },
  },
});

/** 「添加文件」虚框按钮 */
export const addFileBtn = style({
  display: 'inline-flex',
  height: '28px',
  minWidth: '28px',
  marginBottom: '4px',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.sm,
  border: `1px dashed ${vars.color.borderStrong}`,
  backgroundColor: 'transparent',
  fontSize: vars.font.sizeMd,
  color: vars.color.textMuted,
  selectors: {
    '&:hover': {
      borderColor: vars.color.brand,
      color: vars.color.brand,
    },
  },
});

/** 语言输入框在 modalInput 基础上固定宽度（文件名框占剩余空间） */
export const langInput = style({
  flex: '0 0 200px',
});

/** CodeMirror 编辑器区（占满模态剩余高度，可滚动） */
export const editorArea = style({
  flex: 1,
  overflow: 'auto',
  fontSize: vars.font.sizeSm,
});

globalStyle(`${editorArea} .cm-editor`, {
  height: '100%',
  minHeight: '260px',
});

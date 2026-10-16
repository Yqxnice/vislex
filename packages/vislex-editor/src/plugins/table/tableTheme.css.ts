/** Lexical 表格主题类（theme.table* 引用；单元格内段落间距用 globalStyle 压掉） */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const table = style({
  margin: '10px 0',
  width: '100%',
  tableLayout: 'fixed',
  borderCollapse: 'collapse',
});

export const tableCell = style({
  position: 'relative',
  border: `1px solid ${vars.color.borderStrong}`,
  padding: `${vars.space.xs} ${vars.space.sm}`,
  verticalAlign: 'top',
});

globalStyle(`${tableCell} p`, {
  margin: 0,
  minHeight: '1.4em',
});

export const tableCellHeader = style({
  backgroundColor: vars.color.codeBg,
  fontWeight: 600,
  textAlign: 'left',
});

/** 选中单元格的 ::after 高亮蒙层 */
export const tableCellSelected = style({
  position: 'relative',
  selectors: {
    '&::after': {
      pointerEvents: 'none',
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(37, 99, 235, 0.12)',
      content: '""',
    },
    '.dark &::after': {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
  },
});

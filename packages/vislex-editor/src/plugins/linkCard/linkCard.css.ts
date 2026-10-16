/**
 * 链接卡片样式（LinkCardComponent 全套渲染器共用）。
 * 颜色走 style-token vars（暗色由 .dark 祖先类翻转变量值）；
 * 少数非语义色（GitHub 黑 / kindTag 彩色 / 错误红）为 Tailwind 调色板字面量，按约定不写 dark: 变体。
 * group/lc 字面类：供箭头 hover 联动（见文件底部 globalStyle）。
 */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

// ---------- 卡片容器 ----------

/** 卡片基类：compact/wide 仅差对齐与间距 */
const cardBase = style({
  display: 'flex',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  padding: '14px 16px',
  color: vars.color.text,
  textDecoration: 'none',
  transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
  selectors: {
    '&:hover': {
      borderColor: vars.color.borderStrong,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    },
  },
});

const cardCompactStyle = style([cardBase, { alignItems: 'center', gap: vars.space.md }]);
const cardWideStyle = style([cardBase, { alignItems: 'stretch', gap: '14px' }]);
const cardErrorStyle = style([
  cardBase,
  {
    alignItems: 'center',
    gap: vars.space.md,
    borderStyle: 'dashed',
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
]);

/** 紧凑卡片（单行信息），附 group/lc 字面类供箭头 hover 联动 */
export const cardCompact = `${cardCompactStyle} group/lc`;
/** 宽版卡片（多区块描述），附 group/lc 字面类 */
export const cardWide = `${cardWideStyle} group/lc`;
/** 错误状态卡片：虚线红框 + 浅红底 */
export const cardError = `${cardErrorStyle} group/lc`;

/** 加载占位 */
export const loading = style({
  borderRadius: vars.radius.md,
  border: `1px dashed ${vars.color.border}`,
  backgroundColor: vars.color.surfaceMuted,
  padding: '14px 16px',
  textAlign: 'center',
  fontSize: vars.font.sizeSm,
  color: vars.color.textMuted,
});

// ---------- 左侧图标 / 封面 ----------

const iconBase = style({
  display: 'flex',
  width: '36px',
  height: '36px',
  flex: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
});

export const icon = style([
  iconBase,
  { backgroundColor: vars.color.codeBg, color: vars.color.textMuted },
]);
export const iconError = style([iconBase, { backgroundColor: '#fef2f2', color: '#ef4444' }]);
export const iconGithub = style([iconBase, { backgroundColor: '#24292f', color: '#ffffff' }]);
export const iconMusic = style({
  display: 'flex',
  width: '52px',
  height: '52px',
  flex: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.md,
  backgroundImage: 'linear-gradient(to bottom right, #f5f5f5, #e5e5e5)',
  color: vars.color.brand,
});

// ---------- 正文区 ----------

export const bodyCompact = style({
  display: 'flex',
  minWidth: 0,
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.xs,
});

export const bodyWide = style({
  display: 'flex',
  minWidth: 0,
  flex: 1,
  flexDirection: 'column',
  gap: '6px',
});

export const title = style({
  overflow: 'hidden',
  fontSize: vars.font.sizeMd,
  fontWeight: 600,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: vars.color.text,
});

export const titleMono = style([
  title,
  { fontFamily: vars.font.mono, fontSize: vars.font.sizeSm },
]);

/** 错误卡片标题内的行内错误说明 */
export const errorNote = style({
  fontWeight: 400,
  color: '#ef4444',
});

export const url = style({
  overflow: 'hidden',
  fontSize: vars.font.sizeXs,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: vars.color.textMuted,
});

export const desc = style({
  display: '-webkit-box',
  overflow: 'hidden',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  fontSize: vars.font.sizeSm,
  lineHeight: 1.5,
  color: vars.color.textMuted,
});

export const subtitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: vars.font.sizeXs,
  color: vars.color.textMuted,
});

export const repo = style({
  fontFamily: vars.font.mono,
});

// ---------- kind 标签 ----------

const kindTagBase = style({
  display: 'inline-block',
  alignSelf: 'flex-start',
  borderRadius: '4px',
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
});

export const kindTag = style([
  kindTagBase,
  { backgroundColor: vars.color.codeBg, color: vars.color.textMuted },
]);
export const kindTagPr = style([
  kindTagBase,
  { backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' },
]);
export const kindTagIssue = style([
  kindTagBase,
  { backgroundColor: 'rgba(251, 146, 60, 0.12)', color: '#ea580c' },
]);
export const kindTagCommit = style([
  kindTagBase,
  { backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' },
]);
export const kindTagDiscussion = style([
  kindTagBase,
  { backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#9333ea' },
]);
export const kindTagLeetcode = style([
  kindTagBase,
  { backgroundColor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a' },
]);

// ---------- 右侧箭头（随 group/lc hover 联动） ----------

export const arrow = style({
  flex: 'none',
  fontSize: vars.font.sizeLg,
  lineHeight: 1,
  color: vars.color.textMuted,
  transition: 'transform 150ms ease, color 150ms ease',
});

globalStyle(`.group\\/lc:hover ${arrow}`, {
  transform: 'translateX(2px)',
  color: vars.color.brand,
});

// ---------- 封面缩略图 ----------

export const thumb = style({
  width: '72px',
  height: '72px',
  flex: 'none',
  overflow: 'hidden',
  borderRadius: '8px',
  backgroundColor: vars.color.codeBg,
});

globalStyle(`${thumb} img`, {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

// ---------- LeetCode 专用 ----------

export const head = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
});

/** 难度徽标（背景色按难度行内指定） */
export const difficulty = style({
  borderRadius: '4px',
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.03em',
  color: '#ffffff',
});

export const tags = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.xs,
});

export const tagChip = style({
  borderRadius: '4px',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surfaceMuted,
  padding: '1px 6px',
  fontSize: '11px',
  color: vars.color.textMuted,
});

// ---------- 音乐专用 ----------

export const musicBlock = style({
  marginTop: '2px',
  display: 'flex',
  gap: vars.space.lg,
});

export const musicItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
  fontSize: vars.font.sizeXs,
});

export const musicLabel = style({
  fontSize: '11px',
  color: vars.color.textMuted,
});

export const musicValue = style({
  color: vars.color.text,
});

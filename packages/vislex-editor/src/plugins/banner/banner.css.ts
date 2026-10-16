/**
 * Banner 提示块与类型切换浮动工具条样式。
 * - 语义色（info/success/warning/error）为主题外的固定色，写字面量；
 * - .vislex-banner 是保留的字面钩子类（段落间距覆盖等全局样式挂在它上面）；
 * - 其余颜色走 style-token vars，暗色由 .dark 祖先类翻转。
 */
import { vars } from '@vislex/style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';
import type { BannerType } from './BannerNode.js';

/** 四种类型的语义色（左边框 / 圆形图标底 / 工具条激活底共用） */
const TYPE_COLOR: Record<BannerType, string> = {
  info: '#3b82f6',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
};

/** 四种类型的 0.08 淡底（暗色下被 .dark 变体压为 white/0.04） */
const TYPE_BG: Record<BannerType, string> = {
  info: 'rgba(59, 130, 246, 0.08)',
  success: 'rgba(22, 163, 74, 0.08)',
  warning: 'rgba(217, 119, 6, 0.08)',
  error: 'rgba(220, 38, 38, 0.08)',
};

const bannerBase = style({
  position: 'relative',
  margin: `${vars.space.md} 0`,
  borderRadius: vars.radius.sm,
  borderLeftWidth: '4px',
  borderLeftStyle: 'solid',
  padding: `14px ${vars.space.lg} 14px 44px`,
  color: vars.color.text,
  selectors: {
    '&::before': {
      position: 'absolute',
      top: '14px',
      left: '14px',
      display: 'flex',
      width: '20px',
      height: '20px',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '9999px',
      fontSize: vars.font.sizeXs,
      fontWeight: 700,
      color: '#ffffff',
    },
  },
});

const bannerTypeStyles: Record<BannerType, string> = {
  info: style({
    borderLeftColor: TYPE_COLOR.info,
    backgroundColor: TYPE_BG.info,
    selectors: {
      '&::before': { backgroundColor: TYPE_COLOR.info, content: '"i"' },
      '.dark &': { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
    },
  }),
  success: style({
    borderLeftColor: TYPE_COLOR.success,
    backgroundColor: TYPE_BG.success,
    selectors: {
      '&::before': { backgroundColor: TYPE_COLOR.success, content: '"✓"' },
      '.dark &': { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
    },
  }),
  warning: style({
    borderLeftColor: TYPE_COLOR.warning,
    backgroundColor: TYPE_BG.warning,
    selectors: {
      '&::before': { backgroundColor: TYPE_COLOR.warning, content: '"!"' },
      '.dark &': { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
    },
  }),
  error: style({
    borderLeftColor: TYPE_COLOR.error,
    backgroundColor: TYPE_BG.error,
    selectors: {
      '&::before': { backgroundColor: TYPE_COLOR.error, content: '"✕"' },
      '.dark &': { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
    },
  }),
};

/** banner 类名组合表（vislex-banner 字面钩子类 + 基类 + 类型类），供 BannerNode 使用 */
export const bannerClasses: Record<BannerType, string> = {
  info: `vislex-banner ${bannerBase} ${bannerTypeStyles.info}`,
  success: `vislex-banner ${bannerBase} ${bannerTypeStyles.success}`,
  warning: `vislex-banner ${bannerBase} ${bannerTypeStyles.warning}`,
  error: `vislex-banner ${bannerBase} ${bannerTypeStyles.error}`,
};

/* banner 内部段落由 Lexical 主题类控制 margin，这里压掉段距改用紧凑间距 */
globalStyle('.vislex-banner > p', {
  margin: 0,
});

globalStyle('.vislex-banner > p + p', {
  marginTop: '6px',
});

/* ---------- 类型切换浮动工具条（createPortal 到 body） ---------- */

export const toolbar = style({
  position: 'fixed',
  zIndex: 40,
  display: 'flex',
  gap: vars.space.xs,
  borderRadius: '8px',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  padding: '3px',
  boxShadow: vars.shadow.menu,
});

export const typeBtn = style({
  display: 'inline-flex',
  cursor: 'pointer',
  alignItems: 'center',
  gap: vars.space.xs,
  borderRadius: vars.radius.sm,
  border: `1px solid transparent`,
  backgroundColor: 'transparent',
  padding: `${vars.space.xs} ${vars.space.sm}`,
  fontSize: vars.font.sizeXs,
  color: vars.color.textMuted,
  transition: 'color 150ms ease, background-color 150ms ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.surfaceMuted,
      color: vars.color.text,
    },
    '&[data-active="true"]': {
      color: '#ffffff',
    },
  },
});

/** 激活态按钮底色（按类型） */
export const typeBtnActiveBg: Record<BannerType, string> = {
  info: style({ selectors: { '&[data-active="true"]': { backgroundColor: TYPE_COLOR.info } } }),
  success: style({ selectors: { '&[data-active="true"]': { backgroundColor: TYPE_COLOR.success } } }),
  warning: style({ selectors: { '&[data-active="true"]': { backgroundColor: TYPE_COLOR.warning } } }),
  error: style({ selectors: { '&[data-active="true"]': { backgroundColor: TYPE_COLOR.error } } }),
};

export const typeIconCircle = style({
  display: 'inline-flex',
  width: '16px',
  height: '16px',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  color: '#ffffff',
});

/** 圆形图标的类型底色 */
export const typeIconBg: Record<BannerType, string> = {
  info: style({ backgroundColor: TYPE_COLOR.info }),
  success: style({ backgroundColor: TYPE_COLOR.success }),
  warning: style({ backgroundColor: TYPE_COLOR.warning }),
  error: style({ backgroundColor: TYPE_COLOR.error }),
};

/** 当前类型按钮内的圆形图标底色（压过类型底色） */
export const typeIconCurrent = style({
  backgroundColor: 'rgba(255, 255, 255, 0.25)',
});

/** 按钮文案：窄屏隐藏 */
export const typeBtnLabel = style({
  display: 'none',
  '@media': {
    '(min-width: 640px)': {
      display: 'inline',
    },
  },
});

import {
  assignVars,
  createGlobalTheme,
  createGlobalThemeContract,
  globalStyle,
} from '@vanilla-extract/css';

import {
  darkColors,
  darkShadow,
  font,
  lightColors,
  lightShadow,
  radius,
  space,
} from './themes.js';

/**
 * 主题契约：CSS 变量名保留历史 --vislex-* 命名（含 --vislex-radius 位于 radius.md），
 * 已有文档与宿主覆盖点不失效。
 */
export const vars = createGlobalThemeContract({
  color: {
    /** 默认值: '#e5e7eb' */
    border: 'vislex-border',
    /** 默认值: '#d1d5db' */
    borderStrong: 'vislex-border-strong',
    /** 默认值: '#ffffff' */
    surface: 'vislex-surface',
    /** 默认值: '#f9fafb' */
    surfaceMuted: 'vislex-surface-muted',
    /** 默认值: '#1f2937' */
    text: 'vislex-text',
    /** 默认值: '#9ca3af' */
    textMuted: 'vislex-text-muted',
    /** 默认值: '#2563eb' */
    brand: 'vislex-brand',
    /** 默认值: '#f3f4f6' */
    codeBg: 'vislex-code-bg',
  },
  space: {
    /** 默认值: '4px' */
    xs: 'vislex-space-xs',
    /** 默认值: '8px' */
    sm: 'vislex-space-sm',
    /** 默认值: '12px' */
    md: 'vislex-space-md',
    /** 默认值: '16px' */
    lg: 'vislex-space-lg',
    /** 默认值: '24px' */
    xl: 'vislex-space-xl',
  },
  font: {
    sans: 'vislex-font-sans',
    mono: 'vislex-font-mono',
    /** 默认值: '12px' */
    sizeXs: 'vislex-font-size-xs',
    /** 默认值: '13px' */
    sizeSm: 'vislex-font-size-sm',
    /** 默认值: '14px' */
    sizeMd: 'vislex-font-size-md',
    /** 默认值: '16px' */
    sizeLg: 'vislex-font-size-lg',
  },
  radius: {
    /** 默认值: '6px' */
    sm: 'vislex-radius-sm',
    /** 默认值: '10px'（历史 --vislex-radius） */
    md: 'vislex-radius',
    /** 默认值: '12px' */
    lg: 'vislex-radius-lg',
  },
  shadow: {
    menu: 'vislex-shadow-menu',
    modal: 'vislex-shadow-modal',
  },
});

const lightTokens = {
  color: lightColors,
  space,
  font,
  radius,
  shadow: lightShadow,
};

// 编辑器根：亮色默认值
createGlobalTheme('.vislex-root', vars, lightTokens);

// portal 挂载到 body、脱离 .vislex-root 子树的弹层，需重新声明变量
createGlobalTheme('.vislex-modal', vars, lightTokens);

// 暗色：仅翻转颜色与阴影，间距/字体/圆角不动（避免选择器同优先级下的覆盖次序问题）
const darkOverrides = {
  ...assignVars(vars.color, darkColors),
  ...assignVars(vars.shadow, darkShadow),
};

globalStyle('.dark .vislex-root', { vars: darkOverrides });
globalStyle('.dark .vislex-modal', { vars: darkOverrides });

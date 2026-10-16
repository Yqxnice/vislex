/**
 * vislex 主题 token 值表。
 * 颜色在明/暗两套间翻转；间距、字体、圆角两套共用。
 * CSS 变量名契约见 vars.css.ts（--vislex-* 前缀，与历史契约保持一致）。
 */

export const lightColors = {
  /** 默认值: '#e5e7eb' */
  border: '#e5e7eb',
  /** 默认值: '#d1d5db' */
  borderStrong: '#d1d5db',
  /** 默认值: '#ffffff' */
  surface: '#ffffff',
  /** 默认值: '#f9fafb' */
  surfaceMuted: '#f9fafb',
  /** 默认值: '#1f2937' */
  text: '#1f2937',
  /** 默认值: '#9ca3af' */
  textMuted: '#9ca3af',
  /** 默认值: '#2563eb' */
  brand: '#2563eb',
  /** 默认值: '#f3f4f6' */
  codeBg: '#f3f4f6',
};

export const darkColors = {
  border: '#1f2937',
  borderStrong: '#374151',
  surface: '#030712',
  surfaceMuted: '#111827',
  text: '#f3f4f6',
  textMuted: '#6b7280',
  brand: '#3b82f6',
  codeBg: '#1f2937',
};

export const space = {
  /** 默认值: '4px' */
  xs: '4px',
  /** 默认值: '8px' */
  sm: '8px',
  /** 默认值: '12px' */
  md: '12px',
  /** 默认值: '16px' */
  lg: '16px',
  /** 默认值: '24px' */
  xl: '24px',
};

export const font = {
  /** 默认值: 系统中文字体栈 */
  sans: '"PingFang SC", "Microsoft YaHei", "Segoe UI", Roboto, Helvetica, "noto sans sc", "hiragino sans gb", -apple-system, system-ui, sans-serif',
  /** 默认值: 系统等宽字体栈 */
  mono: 'ui-monospace, SFMono-Regular, "DejaVu Sans Mono", Menlo, Consolas, monospace',
  /** 默认值: '12px' */
  sizeXs: '12px',
  /** 默认值: '13px' */
  sizeSm: '13px',
  /** 默认值: '14px' */
  sizeMd: '14px',
  /** 默认值: '16px' */
  sizeLg: '16px',
};

export const radius = {
  /** 默认值: '6px' */
  sm: '6px',
  /** 默认值: '10px'（对应历史 --vislex-radius） */
  md: '10px',
  /** 默认值: '12px' */
  lg: '12px',
};

export const lightShadow = {
  /** 默认值: 菜单/浮层阴影 */
  menu: '0 1px 4px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.08)',
  /** 默认值: 模态阴影 */
  modal: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
};

export const darkShadow = {
  menu: '0 1px 4px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.4)',
  modal: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
};

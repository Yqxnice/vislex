import type { ReactNode } from 'react';

/**
 * portal 弹层的主题契约类：挂在 portal 内容 wrapper 上，
 * 重新声明 --vislex-* 变量（见 vars.css.ts 中 .vislex-modal 的两块声明）。
 * 暗色仍由 .dark 祖先类驱动，无需 JS 参与。
 */
export const portalThemeClass = 'vislex-modal';

export function PortalThemeWrapper({ children }: { children?: ReactNode }) {
  return (
    <div suppressHydrationWarning className={portalThemeClass} style={{ display: 'contents' }}>
      {children}
    </div>
  );
}

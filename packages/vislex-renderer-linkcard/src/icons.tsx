/** 内联 SVG 图标（path 数据与 lucide 同源；renderer 包保持零图标库依赖） */
import type { ReactNode } from 'react';

interface IconProps {
  size?: number;
  children: ReactNode;
}

function Icon({ size = 24, children }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function AlertTriangleIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Icon>
  );
}

export function MusicIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </Icon>
  );
}

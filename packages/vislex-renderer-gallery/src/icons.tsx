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

export function ChevronLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  );
}

export function ChevronRightIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  );
}

export function XIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

export function Maximize2Icon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M15 3h6v6" />
      <path d="m21 3-7 7" />
      <path d="m3 21 7-7" />
      <path d="M9 21H3v-6" />
    </Icon>
  );
}

export function ImagePlusIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M16 5h6" />
      <path d="M19 2v6" />
      <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      <circle cx="9" cy="9" r="2" />
    </Icon>
  );
}

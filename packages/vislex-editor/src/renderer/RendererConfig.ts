import type { ComponentType } from 'react';

import type { CodeFile } from '../plugins/codeBlock/CodeBlockNode.js';
import type { GalleryImage, GalleryLayout } from '../plugins/gallery/GalleryNode.js';
import type { LinkCardData, LinkCardShape } from '../plugins/linkCard/LinkCardNode.js';
import type { WhiteboardMode } from '../plugins/whiteboard/WhiteboardNode.js';

/** 代码块渲染槽 props（多文件） */
export interface CodeBlockRendererProps {
  files: CodeFile[];
}

/** Mermaid 图表渲染槽 props */
export interface MermaidRendererProps {
  code: string;
}

/** KaTeX 公式渲染槽 props（行内与块级同一槽位，displayMode 区分） */
export interface MathRendererProps {
  equation: string;
  displayMode: boolean;
}

/** 图库渲染槽 props */
export interface GalleryRendererProps {
  layout: GalleryLayout;
  images: GalleryImage[];
}

/** 白板渲染槽 props（三种存储策略的原始字段） */
export interface WhiteboardRendererProps {
  mode: WhiteboardMode;
  scene: string;
  src: string;
  patch: string;
}

/** 链接卡片渲染槽 props（data 为已缓存的匹配结果，渲染端不再 fetch） */
export interface LinkCardRendererProps {
  url: string;
  shape: LinkCardShape;
  matcherName?: string;
  data?: LinkCardData;
  error?: string;
}

/** 视频块渲染槽 props */
export interface VideoRendererProps {
  src: string;
  poster?: string;
  title?: string;
}

/** 嵌入块渲染槽 props */
export interface EmbedRendererProps {
  src: string;
  title?: string;
}

/** Ruby 注音渲染槽 props */
export interface RubyRendererProps {
  base: string;
  rt: string;
}

/**
 * 渲染槽配置：static 节点的 decorate 一律经 createRendererDecoration 走槽位，
 * 重依赖（shiki/katex/mermaid 等）由 renderer-* 包在 compose 时注入，
 * 节点本体 defaultRenderer 一律为 undefined，保证纯展示宿主不被拖入整库。
 *
 * 扩展包与下游应用可通过 TypeScript module augmentation 增加自有槽位：
 *
 * ```ts
 * import type { ComponentType } from 'react'
 * import type {} from '@vislex/editor'
 *
 * declare module '@vislex/editor' {
 *   interface RendererConfig {
 *     MyChart?: ComponentType<MyChartProps>
 *   }
 * }
 * ```
 *
 * 约定：
 * - 槽位保持可选（?）：既无注入也无默认渲染器时 wrapper 渲染 null；
 * - 槽位 props 类型保持稳定，改名/改字段对所有已注册模块都是破坏性变更。
 */
export interface RendererConfig {
  /** 代码块（shiki 高亮 + 多文件标签页） */
  CodeBlock?: ComponentType<CodeBlockRendererProps>;
  /** Mermaid 图表 */
  Mermaid?: ComponentType<MermaidRendererProps>;
  /** KaTeX 公式（行内 + 块级） */
  Math?: ComponentType<MathRendererProps>;
  /** 图库（grid / masonry / carousel + 灯箱） */
  Gallery?: ComponentType<GalleryRendererProps>;
  /** Excalidraw 白板（只读快照） */
  Whiteboard?: ComponentType<WhiteboardRendererProps>;
  /** 链接预览卡片 */
  LinkCard?: ComponentType<LinkCardRendererProps>;
  /** 视频块 */
  Video?: ComponentType<VideoRendererProps>;
  /** iframe 嵌入块 */
  Embed?: ComponentType<EmbedRendererProps>;
  /** Ruby 注音 */
  Ruby?: ComponentType<RubyRendererProps>;
}

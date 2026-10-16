/**
 * 静态渲染入口（对标 haklex static-entry）：
 * - 导出 static 节点注册表（allNodes）与全部 static 节点类/工厂/类型；
 * - 导出渲染槽契约（RendererConfig/Provider/Wrapper）与编辑器主题（baseTheme），
 *   供 RichRenderer 组装内置渲染引擎时使用；
 * - 供 RichRenderer 等纯展示宿主使用；编辑器请从主入口或 config-edit 取 Edit 版；
 * - static 节点的 decorate 一律经 RendererConfig 槽位解析，重依赖（shiki/katex/mermaid）
 *   的注入与拆包在 Phase 3 的 renderer-* 包中落地。
 */

export { allNodes, builtinNodes, customNodes } from './config.js';

export { baseTheme } from './composer/theme.js';

export { RendererConfigProvider, useRendererConfig } from './renderer/RendererConfigContext.js';
export { RendererWrapper, createRendererDecoration } from './renderer/RendererWrapper.js';
export type { RendererKey, RendererWrapperProps } from './renderer/RendererWrapper.js';
export type {
  RendererConfig,
  CodeBlockRendererProps,
  MermaidRendererProps,
  MathRendererProps,
  GalleryRendererProps,
  WhiteboardRendererProps,
  LinkCardRendererProps,
  VideoRendererProps,
  EmbedRendererProps,
  RubyRendererProps,
} from './renderer/RendererConfig.js';

export { CodeBlockNode, $createCodeBlockNode, $isCodeBlockNode } from './plugins/codeBlock/CodeBlockNode.js';
export type { CodeFile, SerializedCodeBlockNode } from './plugins/codeBlock/CodeBlockNode.js';

export { MermaidNode, $createMermaidNode, $isMermaidNode } from './plugins/mermaid/MermaidNode.js';
export type { SerializedMermaidNode } from './plugins/mermaid/MermaidNode.js';

export { InlineMathNode, $createInlineMathNode, $isInlineMathNode } from './plugins/math/InlineMathNode.js';
export type { SerializedInlineMathNode } from './plugins/math/InlineMathNode.js';
export { BlockMathNode, $createBlockMathNode, $isBlockMathNode } from './plugins/math/BlockMathNode.js';
export type { SerializedBlockMathNode } from './plugins/math/BlockMathNode.js';

export { BannerNode, $createBannerNode, $isBannerNode, BANNER_TYPES } from './plugins/banner/BannerNode.js';
export type { BannerType, SerializedBannerNode } from './plugins/banner/BannerNode.js';

export { WhiteboardNode, $createWhiteboardNode, $isWhiteboardNode } from './plugins/whiteboard/WhiteboardNode.js';
export type { SerializedWhiteboardNode, WhiteboardMode } from './plugins/whiteboard/WhiteboardNode.js';

export { GalleryNode, $createGalleryNode, $isGalleryNode, GALLERY_LAYOUTS } from './plugins/gallery/GalleryNode.js';
export type { GalleryImage, GalleryLayout, SerializedGalleryNode } from './plugins/gallery/GalleryNode.js';

export { LinkCardNode, $createLinkCardNode, $isLinkCardNode, LINK_CARD_SHAPES } from './plugins/linkCard/LinkCardNode.js';
export type { LinkCardShape, LinkCardData, SerializedLinkCardNode } from './plugins/linkCard/LinkCardNode.js';

export { VideoNode, $createVideoNode, $isVideoNode } from './plugins/video/VideoNode.js';
export type { SerializedVideoNode } from './plugins/video/VideoNode.js';

export { EmbedNode, $createEmbedNode, $isEmbedNode } from './plugins/embed/EmbedNode.js';
export type { SerializedEmbedNode } from './plugins/embed/EmbedNode.js';

export { MentionNode, $createMentionNode, $isMentionNode } from './plugins/mention/MentionNode.js';
export type { SerializedMentionNode } from './plugins/mention/MentionNode.js';

export { RubyNode, $createRubyNode, $isRubyNode } from './plugins/ruby/RubyNode.js';
export type { SerializedRubyNode } from './plugins/ruby/RubyNode.js';

/** 以下 VE 类名供 RichRenderer 渲染内置节点（banner/mention/table）时复用，保持单一来源 */
export { bannerClasses } from './plugins/banner/banner.css';
export { node as mentionNodeClass } from './plugins/mention/mention.css';
export {
  table as tableClass,
  tableCell as tableCellClass,
  tableCellHeader as tableCellHeaderClass,
} from './plugins/table/tableTheme.css';

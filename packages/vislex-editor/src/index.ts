export { Editor } from './ui/Editor.js';
export type { EditorProps } from './ui/Editor.js';
export { Toolbar } from './ui/Toolbar.js';
export { EditorModal } from './ui/EditorModal.js';
export type { EditorModalProps } from './ui/EditorModal.js';
export { PluginHost } from './plugin/PluginHost.js';

export { blogEditorPreset } from './presets/blog.js';

export { richTextPlugin } from './plugins/richText.js';
export { alignPlugin } from './plugins/align/index.js';
export {
  ALIGN_HEADING_TRANSFORMER,
  ALIGN_QUOTE_TRANSFORMER,
  ALIGN_PARAGRAPH_TRANSFORMER,
  ALIGN_TRANSFORMERS,
} from './plugins/align/index.js';
export { fontPlugin } from './plugins/font.js';
export { listPlugin } from './plugins/list.js';
export { linkPlugin } from './plugins/link.js';
export { historyPlugin } from './plugins/history.js';
export { codeBlockPlugin } from './plugins/codeBlock/index.js';
export {
  $createCodeBlockNode,
  $isCodeBlockNode,
  CodeBlockNode,
  CODE_BLOCK_TRANSFORMERS,
  resolveLanguage,
} from './plugins/codeBlock/index.js';
export type { CodeFile, SerializedCodeBlockNode } from './plugins/codeBlock/index.js';

export { mathPlugin } from './plugins/math/index.js';
export {
  $createInlineMathNode,
  $isInlineMathNode,
  InlineMathNode,
  $createBlockMathNode,
  $isBlockMathNode,
  BlockMathNode,
  MATH_TRANSFORMERS,
  OPEN_MATH_MODAL_COMMAND,
} from './plugins/math/index.js';
export type { SerializedInlineMathNode, SerializedBlockMathNode } from './plugins/math/index.js';

export { bannerPlugin } from './plugins/banner/index.js';
export {
  $createBannerNode,
  $isBannerNode,
  BannerNode,
  BANNER_TYPES,
  BANNER_TRANSFORMERS,
  BANNER_TYPE_META,
} from './plugins/banner/index.js';
export type { BannerType, SerializedBannerNode } from './plugins/banner/index.js';

export { mermaidPlugin } from './plugins/mermaid/index.js';
export {
  $createMermaidNode,
  $isMermaidNode,
  MermaidNode,
  MERMAID_TRANSFORMERS,
} from './plugins/mermaid/index.js';
export type { SerializedMermaidNode } from './plugins/mermaid/index.js';

export { whiteboardPlugin } from './plugins/whiteboard/index.js';
export {
  $createWhiteboardNode,
  $isWhiteboardNode,
  WhiteboardNode,
  WHITEBOARD_TRANSFORMERS,
  WhiteboardStorageProvider,
  useWhiteboardStorage,
  diffScenes,
  applyJsonPatch,
  resolveDeltaScene,
  parseScene,
  emptyScene,
  stringifyScene,
} from './plugins/whiteboard/index.js';
export type {
  SerializedWhiteboardNode,
  WhiteboardMode,
  WhiteboardStorage,
  WhiteboardScene,
  WhiteboardElement,
  JsonPatchOp,
} from './plugins/whiteboard/index.js';

export { litexmlPlugin, $insertLiteXML, $exportLiteXML, looksLikeLiteXML } from './plugins/litexml/index.js';
export { jsonToLiteXML, liteXMLToJson } from './plugins/litexml/litexml.bridge.js';
export { createEditorConfig, collectNodes } from './composer/createEditorConfig.js';
export { baseTheme } from './composer/theme.js';

export { galleryPlugin } from './plugins/gallery/index.js';
export {
  $createGalleryNode,
  $isGalleryNode,
  GalleryNode,
  GALLERY_LAYOUTS,
  GALLERY_TRANSFORMERS,
  normalizeGalleryImages,
  normalizeGalleryLayout,
  GalleryStorageProvider,
  useGalleryStorage,
} from './plugins/gallery/index.js';
export type { GalleryImage, GalleryLayout, SerializedGalleryNode, GalleryStorage } from './plugins/gallery/index.js';

export { linkCardPlugin } from './plugins/linkCard/index.js';
export {
  $createLinkCardNode,
  $isLinkCardNode,
  LinkCardNode,
  LINK_CARD_SHAPES,
  LINKCARD_TRANSFORMERS,
  normalizeLinkCardShape,
  registerMatcher,
  unregisterMatcher,
  listMatchers,
  findMatcherForUrl,
  registerBuiltinMatchers,
} from './plugins/linkCard/index.js';
export type { LinkCardShape, LinkCardData, SerializedLinkCardNode, LinkCardMatcher } from './plugins/linkCard/index.js';

export { videoPlugin } from './plugins/video/index.js';
export {
  $createVideoNode,
  $isVideoNode,
  VideoNode,
  VIDEO_TRANSFORMERS,
  VideoStorageProvider,
  useVideoStorage,
} from './plugins/video/index.js';
export type { SerializedVideoNode, VideoStorage } from './plugins/video/index.js';

export { embedPlugin } from './plugins/embed/index.js';
export {
  $createEmbedNode,
  $isEmbedNode,
  EmbedNode,
  EMBED_TRANSFORMERS,
} from './plugins/embed/index.js';
export type { SerializedEmbedNode } from './plugins/embed/index.js';

export { mentionPlugin, OPEN_MENTION_MODAL_COMMAND } from './plugins/mention/index.js';
export {
  $createMentionNode,
  $isMentionNode,
  MentionNode,
  MENTION_TRANSFORMERS,
} from './plugins/mention/index.js';
export type { SerializedMentionNode } from './plugins/mention/index.js';

export { rubyPlugin, OPEN_RUBY_MODAL_COMMAND } from './plugins/ruby/index.js';
export {
  $createRubyNode,
  $isRubyNode,
  RubyNode,
  RUBY_TRANSFORMERS,
} from './plugins/ruby/index.js';
export type { SerializedRubyNode } from './plugins/ruby/index.js';

export { tablePlugin } from './plugins/table/index.js';
export { slashMenuPlugin } from './plugins/slash/index.js';
export { draggableBlockPlugin } from './plugins/draggableBlock/index.js';

// ---- 节点注册表（static / edit 双树，对标 haklex config.ts / config-edit.ts）----
export { allNodes, builtinNodes, customNodes } from './config.js';
export { allEditNodes, customEditNodes } from './config-edit.js';

// ---- 渲染槽契约（static 节点 decorate 经槽位渲染，重依赖由 renderer-* 包 compose 注入）----
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

// ---- Edit 节点（编辑器端可编辑变体；静态基类见 ./static）----
export { CodeBlockEditNode, $createCodeBlockEditNode, $isCodeBlockEditNode } from './plugins/codeBlock/index.js';
export { MermaidEditNode, $createMermaidEditNode, $isMermaidEditNode } from './plugins/mermaid/index.js';
export {
  InlineMathEditNode,
  $createInlineMathEditNode,
  $isInlineMathEditNode,
  BlockMathEditNode,
  $createBlockMathEditNode,
  $isBlockMathEditNode,
} from './plugins/math/index.js';
export { WhiteboardEditNode, $createWhiteboardEditNode, $isWhiteboardEditNode } from './plugins/whiteboard/index.js';
export { GalleryEditNode, $createGalleryEditNode, $isGalleryEditNode } from './plugins/gallery/index.js';
export { LinkCardEditNode, $createLinkCardEditNode, $isLinkCardEditNode } from './plugins/linkCard/index.js';
export { VideoEditNode, $createVideoEditNode, $isVideoEditNode } from './plugins/video/index.js';
export { EmbedEditNode, $createEmbedEditNode, $isEmbedEditNode } from './plugins/embed/index.js';
export { MentionEditNode, $createMentionEditNode, $isMentionEditNode } from './plugins/mention/index.js';
export { RubyEditNode, $createRubyEditNode, $isRubyEditNode } from './plugins/ruby/index.js';

export type { EditorPlugin, EditorPreset, ToolbarItem, ToolbarButtonItem, ToolbarSelectItem } from './types.js';

/**
 * @vislex/headless — vislex 的零 React / 零 DOM 服务端词法层。
 *
 * 三块内容：
 * 1. 零 React 自定义节点（12 个，原 apps/core 副本的唯一权威实现）；
 * 2. headless / editor 共用的 Markdown 转换器工厂（createXxxTransformers），
 *    通过依赖注入节点类，编辑器侧注入可编辑 Edit 节点（type 字符串一致即可互换）；
 * 3. 高层 API：jsonToMarkdown / markdownToEditorState / 翻译块抽取回填。
 */

// ===== 高层 Markdown API =====
export {
  EMPTY_EDITOR_STATE,
  HEADLESS_NODES,
  MARKDOWN_TRANSFORMERS,
  applyTranslations,
  extractTranslatableBlocks,
  jsonToMarkdown,
  markdownToEditorState,
  type TranslatableBlock,
} from './markdown.js';

// ===== LiteXML 桥（转出口，词汇表唯一实现在 @vislex/litexml） =====
export { jsonToLiteXML, liteXMLToJson } from '@vislex/litexml';

// ===== 转换器工厂（编辑器侧注入 Edit 节点类使用） =====
export {
  ALIGN_TRANSFORMERS,
  ALIGN_HEADING_TRANSFORMER,
  ALIGN_PARAGRAPH_TRANSFORMER,
  ALIGN_QUOTE_TRANSFORMER,
} from './align.transformer.js';
export { TABLE_TRANSFORMERS } from './table.transformer.js';
export { createCodeBlockTransformers, CODE_BLOCK_TRANSFORMERS } from './code-block.transformer.js';
export type { CodeBlockTransformersDeps } from './code-block.transformer.js';
export { createMermaidTransformers, MERMAID_TRANSFORMERS } from './mermaid.transformer.js';
export type { MermaidTransformersDeps } from './mermaid.transformer.js';
export { createWhiteboardTransformers, WHITEBOARD_TRANSFORMERS } from './whiteboard.transformer.js';
export type { WhiteboardTransformersDeps } from './whiteboard.transformer.js';
export { createGalleryTransformers, GALLERY_TRANSFORMERS } from './gallery.transformer.js';
export type { GalleryTransformersDeps } from './gallery.transformer.js';
export { createLinkCardTransformers, LINKCARD_TRANSFORMERS } from './linkcard.transformer.js';
export type { LinkCardTransformersDeps } from './linkcard.transformer.js';
export { createVideoTransformers, VIDEO_TRANSFORMERS } from './video.transformer.js';
export type { VideoTransformersDeps } from './video.transformer.js';
export { createEmbedTransformers, EMBED_TRANSFORMERS } from './embed.transformer.js';
export type { EmbedTransformersDeps } from './embed.transformer.js';
export { createMathTransformers, MATH_TRANSFORMERS } from './math.transformer.js';
export type { MathTransformersDeps } from './math.transformer.js';
export { createBannerTransformers, BANNER_TRANSFORMERS } from './banner.transformer.js';
export type { BannerTransformersDeps } from './banner.transformer.js';
export { createMentionTransformers, MENTION_TRANSFORMERS } from './mention.transformer.js';
export type { MentionTransformersDeps } from './mention.transformer.js';
export { createRubyTransformers, RUBY_TRANSFORMERS } from './ruby.transformer.js';
export type { RubyTransformersDeps } from './ruby.transformer.js';

// ===== 零 React 节点（类 / 工厂 / 守卫 / 类型） =====
export * from './code-block.node.js';
export * from './mermaid.node.js';
export * from './whiteboard.node.js';
export * from './gallery.node.js';
export * from './linkcard.node.js';
export * from './video.node.js';
export * from './embed.node.js';
export * from './mention.node.js';
export * from './ruby.node.js';
export * from './math-inline.node.js';
export * from './math-block.node.js';
export * from './banner.node.js';

import {
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  LINK,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  UNORDERED_LIST,
  type Transformer,
} from '@lexical/markdown';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { alignPlugin } from '../plugins/align';
import { codeBlockPlugin } from '../plugins/codeBlock';
import { CodeBlockNode } from '../plugins/codeBlock/CodeBlockNode';
import { fontPlugin } from '../plugins/font';
import { historyPlugin } from '../plugins/history';
import { linkPlugin } from '../plugins/link';
import { listPlugin } from '../plugins/list';
import { richTextPlugin } from '../plugins/richText';
import { mathPlugin } from '../plugins/math';
import { BlockMathNode, InlineMathNode } from '../plugins/math/nodes';
import { bannerPlugin } from '../plugins/banner';
import { BannerNode } from '../plugins/banner/BannerNode';
import { mermaidPlugin } from '../plugins/mermaid';
import { MermaidNode } from '../plugins/mermaid/MermaidNode';
import { whiteboardPlugin } from '../plugins/whiteboard';
import { WhiteboardNode } from '../plugins/whiteboard/WhiteboardNode';
import { galleryPlugin } from '../plugins/gallery';
import { GalleryNode } from '../plugins/gallery/GalleryNode';
import { linkCardPlugin } from '../plugins/linkCard';
import { LinkCardNode } from '../plugins/linkCard/LinkCardNode';
import { videoPlugin } from '../plugins/video';
import { VideoNode } from '../plugins/video/VideoNode';
import { embedPlugin } from '../plugins/embed';
import { EmbedNode } from '../plugins/embed/EmbedNode';
import { mentionPlugin } from '../plugins/mention';
import { MentionNode } from '../plugins/mention/MentionNode';
import { MENTION_TRANSFORMERS } from '../plugins/mention/transformer';
import { rubyPlugin } from '../plugins/ruby';
import { RubyNode } from '../plugins/ruby/RubyNode';
import { RUBY_TRANSFORMERS } from '../plugins/ruby/transformer';
import { tablePlugin } from '../plugins/table';
import { slashMenuPlugin } from '../plugins/slash';
import { draggableBlockPlugin } from '../plugins/draggableBlock';
import { litexmlPlugin } from '../plugins/litexml';
import type { EditorPreset } from '../types';

/**
 * 博客正文的 Markdown 转换器集合。
 * 代码块（围栏 / :::code-group）由 codeBlockPlugin 以插件 transformers 形式追加。
 * mention / ruby 为 text-match，必须排在内置 LINK 之前，否则被普通链接吞掉。
 */
const blogTransformers: Transformer[] = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  BOLD_STAR,
  BOLD_ITALIC_STAR,
  ITALIC_STAR,
  STRIKETHROUGH,
  INLINE_CODE,
  ...RUBY_TRANSFORMERS,
  ...MENTION_TRANSFORMERS,
  LINK,
];

/**
 * 博客正文预设：内容以 Markdown 字符串与外部交换。
 * 节点以「转换器需要哪些」为准显式声明，插件各自再声明自己用到的节点，收集时去重。
 * 注意插件顺序：mermaidPlugin、whiteboardPlugin 必须排在 codeBlockPlugin 之前，
 * 否则 ```mermaid / ```whiteboard 会被通用围栏规则吞成普通代码块。
 */
export const blogEditorPreset: EditorPreset = {
  name: 'blog',
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    TableNode,
    TableRowNode,
    TableCellNode,
    CodeBlockNode,
    MermaidNode,
    InlineMathNode,
    BlockMathNode,
    BannerNode,
    WhiteboardNode,
    GalleryNode,
    LinkCardNode,
    VideoNode,
    EmbedNode,
    MentionNode,
    RubyNode,
  ],
  plugins: [
    richTextPlugin,
    alignPlugin,
    fontPlugin,
    listPlugin,
    linkPlugin,
    historyPlugin,
    mermaidPlugin,
    whiteboardPlugin,
    galleryPlugin,
    linkCardPlugin,
    videoPlugin,
    embedPlugin,
    mentionPlugin,
    rubyPlugin,
    tablePlugin,
    slashMenuPlugin,
    draggableBlockPlugin,
    codeBlockPlugin,
    mathPlugin,
    bannerPlugin,
    litexmlPlugin,
  ],
  transformers: blogTransformers,
  placeholder: '开始写正文，支持 Markdown 快捷语法…',
};

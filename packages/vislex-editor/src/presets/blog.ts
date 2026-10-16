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
import { allEditNodes } from '../config-edit.js';
import { alignPlugin } from '../plugins/align/index.js';
import { codeBlockPlugin } from '../plugins/codeBlock/index.js';
import { fontPlugin } from '../plugins/font.js';
import { historyPlugin } from '../plugins/history.js';
import { linkPlugin } from '../plugins/link.js';
import { listPlugin } from '../plugins/list.js';
import { richTextPlugin } from '../plugins/richText.js';
import { mathPlugin } from '../plugins/math/index.js';
import { bannerPlugin } from '../plugins/banner/index.js';
import { mermaidPlugin } from '../plugins/mermaid/index.js';
import { whiteboardPlugin } from '../plugins/whiteboard/index.js';
import { galleryPlugin } from '../plugins/gallery/index.js';
import { linkCardPlugin } from '../plugins/linkCard/index.js';
import { videoPlugin } from '../plugins/video/index.js';
import { embedPlugin } from '../plugins/embed/index.js';
import { mentionPlugin } from '../plugins/mention/index.js';
import { MENTION_TRANSFORMERS } from '../plugins/mention/transformer.js';
import { rubyPlugin } from '../plugins/ruby/index.js';
import { RUBY_TRANSFORMERS } from '../plugins/ruby/transformer.js';
import { tablePlugin } from '../plugins/table/index.js';
import { slashMenuPlugin } from '../plugins/slash/index.js';
import { draggableBlockPlugin } from '../plugins/draggableBlock/index.js';
import { litexmlPlugin } from '../plugins/litexml/index.js';
import type { EditorPreset } from '../types.js';

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
 * 节点注册表统一走 config-edit 的 allEditNodes（Edit 版节点），
 * 各插件的 nodes 声明与其去重合并（collectNodes 按 type 去重，preset 优先）。
 * 注意插件顺序：mermaidPlugin、whiteboardPlugin 必须排在 codeBlockPlugin 之前，
 * 否则 ```mermaid / ```whiteboard 会被通用围栏规则吞成普通代码块。
 */
export const blogEditorPreset: EditorPreset = {
  name: 'blog',
  nodes: allEditNodes,
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

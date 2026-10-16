import type { Klass, LexicalNode } from 'lexical';
import { LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';

import { BannerNode } from './plugins/banner/BannerNode.js';
import { CodeBlockNode } from './plugins/codeBlock/CodeBlockNode.js';
import { EmbedNode } from './plugins/embed/EmbedNode.js';
import { GalleryNode } from './plugins/gallery/GalleryNode.js';
import { LinkCardNode } from './plugins/linkCard/LinkCardNode.js';
import { BlockMathNode } from './plugins/math/BlockMathNode.js';
import { InlineMathNode } from './plugins/math/InlineMathNode.js';
import { MentionNode } from './plugins/mention/MentionNode.js';
import { MermaidNode } from './plugins/mermaid/MermaidNode.js';
import { RubyNode } from './plugins/ruby/RubyNode.js';
import { VideoNode } from './plugins/video/VideoNode.js';
import { WhiteboardNode } from './plugins/whiteboard/WhiteboardNode.js';

/**
 * 静态节点注册表（对标 haklex config.ts）：
 * - 全部节点的 static 版本，decorate 只读渲染（无编辑按钮/模态）；
 * - 供 RichRenderer 等纯展示宿主使用；编辑器请用 config-edit.ts 的 allEditNodes。
 */
export const builtinNodes: Array<Klass<LexicalNode>> = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  TableNode,
  TableRowNode,
  TableCellNode,
];

export const customNodes: Array<Klass<LexicalNode>> = [
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
];

export const allNodes: Array<Klass<LexicalNode>> = [...builtinNodes, ...customNodes];

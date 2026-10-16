import type { Klass, LexicalNode } from 'lexical';

import { builtinNodes } from './config.js';
import { BannerNode } from './plugins/banner/BannerNode.js';
import { CodeBlockEditNode } from './plugins/codeBlock/CodeBlockEditNode.js';
import { EmbedEditNode } from './plugins/embed/EmbedEditNode.js';
import { GalleryEditNode } from './plugins/gallery/GalleryEditNode.js';
import { LinkCardEditNode } from './plugins/linkCard/LinkCardEditNode.js';
import { BlockMathEditNode } from './plugins/math/BlockMathEditNode.js';
import { InlineMathEditNode } from './plugins/math/InlineMathEditNode.js';
import { MentionEditNode } from './plugins/mention/MentionNode.js';
import { MermaidEditNode } from './plugins/mermaid/MermaidEditNode.js';
import { RubyEditNode } from './plugins/ruby/RubyEditNode.js';
import { VideoEditNode } from './plugins/video/VideoEditNode.js';
import { WhiteboardEditNode } from './plugins/whiteboard/WhiteboardEditNode.js';

/**
 * 编辑节点注册表（对标 haklex config-edit.ts）：
 * - 与静态表共享同一 type 字符串（Edit 子类继承静态基类 getType）；
 * - 同一编辑器只能注册其中一套，二者不可混用；
 * - banner 的编辑交互在插件层（浮动工具条），节点无需拆分；
 * - linkCard 的编辑交互（fetch + data 持久化）在 LinkCardComponent 内，
 *   依赖编辑器上下文，故同样拆出 Edit 变体。
 */
export const customEditNodes: Array<Klass<LexicalNode>> = [
  CodeBlockEditNode,
  MermaidEditNode,
  InlineMathEditNode,
  BlockMathEditNode,
  BannerNode,
  WhiteboardEditNode,
  GalleryEditNode,
  LinkCardEditNode,
  VideoEditNode,
  EmbedEditNode,
  MentionEditNode,
  RubyEditNode,
];

export const allEditNodes: Array<Klass<LexicalNode>> = [...builtinNodes, ...customEditNodes];

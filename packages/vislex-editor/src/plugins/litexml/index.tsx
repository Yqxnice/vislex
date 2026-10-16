import { COMMAND_PRIORITY_HIGH, PASTE_COMMAND, type PasteCommandType } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { CodeXml } from 'lucide-react';
import type { EditorPlugin } from '../../types.js';
import { CodeBlockNode } from '../codeBlock/CodeBlockNode.js';
import { MermaidNode } from '../mermaid/MermaidNode.js';
import { InlineMathNode } from '../math/InlineMathNode.js';
import { BlockMathNode } from '../math/BlockMathNode.js';
import { BannerNode } from '../banner/BannerNode.js';
import { GalleryNode } from '../gallery/GalleryNode.js';
import { $insertLiteXML, looksLikeLiteXML } from './deserialize.js';
import { $exportLiteXML } from './serialize.js';

/**
 * LiteXML 导入 / 导出。
 * - 粘贴：纯文本 XML（以 <root> 开头）自动解析成节点插入，优先于内置富文本粘贴；
 * - 工具栏「XML」按钮：把当前内容复制成 LiteXML，方便回灌验证往返。
 */

function readPlainText(event: PasteCommandType): string {
  if (typeof ClipboardEvent !== 'undefined' && event instanceof ClipboardEvent) {
    return event.clipboardData?.getData('text/plain') ?? '';
  }
  return (event as InputEvent).dataTransfer?.getData('text/plain') ?? '';
}

export const litexmlPlugin: EditorPlugin = {
  name: 'litexml',
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    CodeBlockNode,
    MermaidNode,
    InlineMathNode,
    BlockMathNode,
    BannerNode,
    GalleryNode,
  ],
  register: (editor) => {
    // 同一次粘贴可能先后触发 paste 与 beforeinput 两次派发，用短锁避免重复插入
    let handling = false;

    return editor.registerCommand(
      PASTE_COMMAND,
      (event: PasteCommandType) => {
        if (handling) {
          // 已经是本次粘贴的第二次派发：吞掉，别让内置富文本粘贴再插一遍原文
          event.preventDefault();
          return true;
        }

        const text = readPlainText(event);
        if (!looksLikeLiteXML(text)) return false;

        const inserted = $insertLiteXML(text);
        if (!inserted) return false;

        handling = true;
        setTimeout(() => {
          handling = false;
        }, 0);
        event.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  },
  toolbar: [
    {
      id: 'litexml-copy',
      label: <CodeXml size={16} />,
      title: '复制为 LiteXML',
      run: (editor) => {
        const xml = editor.read(() => $exportLiteXML());
        void navigator.clipboard?.writeText(xml).catch(() => {});
      },
    },
  ],
};

export { $insertLiteXML, looksLikeLiteXML, rawText, parseLiteXML } from './deserialize.js';
export { $exportLiteXML } from './serialize.js';

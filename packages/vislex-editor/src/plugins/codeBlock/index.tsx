import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical';
import { SquareCode } from 'lucide-react';
import type { EditorPlugin } from '../../types.js';
import { $createCodeBlockEditNode, CodeBlockEditNode } from './CodeBlockEditNode.js';
import { $isCodeBlockNode } from './CodeBlockNode.js';
import { CODE_BLOCK_TRANSFORMERS } from './transformer.js';

/**
 * 多文件高亮代码块。
 * - 静态渲染：shiki 浅色/深色双主题，多文件标签页切换；
 * - 编辑模式：悬浮「编辑」按钮打开 CodeMirror 多文件模态窗口；
 * - Markdown：```lang [name] 单文件围栏 + :::code-group 多文件容器；
 * - 语言：显式指定 > 文件名扩展名 > highlight.js 内容检测。
 */
export const codeBlockPlugin: EditorPlugin = {
  name: 'code-block',
  nodes: [CodeBlockEditNode],
  transformers: CODE_BLOCK_TRANSFORMERS,
  toolbar: [
    {
      id: 'codeBlock',
      label: <SquareCode size={16} />,
      title: '插入代码块',
      isActive: () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        return $isCodeBlockNode(selection.anchor.getNode().getTopLevelElement());
      },
      run: (editor) => {
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          const block = selection.anchor.getNode().getTopLevelElement();
          if (!block || $isCodeBlockNode(block)) return;
          // 当前块的纯文本作为初始代码内容，空块则建空代码块
          const node = $createCodeBlockEditNode([{ code: block.getTextContent() }]);
          block.replace(node);
          // 被替换的块持有原选区，直接提交会因 selection 丢失报错；
          // 落点到代码块后的新段落，保证本次更新结束时选区有效
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
        });
      },
    },
  ],
};

export { $createCodeBlockNode, $isCodeBlockNode, CodeBlockNode } from './CodeBlockNode.js';
export { CodeBlockEditNode, $createCodeBlockEditNode, $isCodeBlockEditNode } from './CodeBlockEditNode.js';
export type { CodeFile, SerializedCodeBlockNode } from './CodeBlockNode.js';
export { CODE_BLOCK_TRANSFORMERS } from './transformer.js';
export { resolveLanguage, detectLanguageFromContent, languageFromFilename } from './languages.js';

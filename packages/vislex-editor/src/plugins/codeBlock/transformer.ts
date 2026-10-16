/**
 * 代码块 Markdown 转换器：编辑器侧薄封装。
 * 转换逻辑的唯一实现位于 @vislex/headless（createCodeBlockTransformers 工厂），
 * 编辑器侧注入可编辑的 CodeBlockEditNode 与语言解析链：
 * 显式标记 normalizeLanguage > 文件名扩展名 > highlight.js 内容检测 > text。
 */

import { createCodeBlockTransformers } from '@vislex/headless';
import { $createCodeBlockEditNode } from './CodeBlockEditNode.js';
import { $isCodeBlockNode, CodeBlockNode } from './CodeBlockNode.js';
import { detectLanguageFromContent, languageFromFilename, normalizeLanguage } from './languages.js';

export const CODE_BLOCK_TRANSFORMERS = createCodeBlockTransformers({
  CodeBlockNode,
  createCodeBlockNode: $createCodeBlockEditNode,
  isCodeBlockNode: $isCodeBlockNode,
  normalizeLangHint: normalizeLanguage,
  detectLanguage: (code, name) =>
    languageFromFilename(name) || detectLanguageFromContent(code) || 'text',
});

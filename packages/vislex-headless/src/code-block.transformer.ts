/**
 * 代码块 Markdown 转换器（headless / editor 共用单一实现）。
 * 通过 createCodeBlockTransformers(deps) 注入当前环境注册的节点类与语言解析钩子。
 *
 * Markdown 格式（两端必须一致）：
 * - 单文件且无文件名：标准围栏 ```lang
 * - 单文件带文件名：```lang [name]
 * - 多文件：:::code-group 容器包裹多个围栏（VuePress 约定，降级可读）
 *
 * 语言解析是两端唯一真实分叉，通过两个可注入钩子抹平：
 * - normalizeLangHint：显式语言标记的规范化。headless 默认仅 toLowerCase（无别名表）；
 *   编辑器注入 languages.ts 的 normalizeLanguage（含别名映射、trim）。
 * - detectLanguage：无显式标记时的补全。headless 默认直接回退 'text'（不引入 highlight.js）；
 *   编辑器注入「文件名扩展名 → highlight.js 内容检测 → text」链。
 */

import { $createParagraphNode, type ElementNode, type Klass, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import {
  $createCodeBlockNode,
  $isCodeBlockNode,
  CodeBlockNode as HeadlessCodeBlockNode,
  type CodeBlockNode,
  type CodeFile,
} from './code-block.node.js';

const FENCE_START_REGEX = /^([ \t]*`{3,})([\w-]+)?[ \t]*(?:\[([^\]]+)\])?[ \t]*$/;
const GROUP_START_REGEX = /^[ \t]*:::code-group[ \t]*$/;
const GROUP_END_REGEX = /^[ \t]*:::[ \t]*$/;

/** 与内置 CODE 一致：内容含反引号串时自动加长围栏 */
function fenceFor(code: string): string {
  const runs = code.match(/`{3,}/g);
  const longest = runs ? Math.max(...runs.map((run) => run.length)) : 0;
  return '`'.repeat(Math.max(3, longest + 1));
}

function fileToMarkdown(file: CodeFile): string {
  const fence = fenceFor(file.code);
  const lang = file.language && file.language !== 'text' ? file.language : '';
  const name = file.name ? ` [${file.name}]` : '';
  return `${fence}${lang}${name}\n${file.code}\n${fence}`;
}

export interface CodeBlockTransformersDeps {
  /** 依赖节点类（编辑器侧用 base CodeBlockNode 即可，type 字符串一致） */
  CodeBlockNode: Klass<LexicalNode>;
  createCodeBlockNode: (files?: CodeFile[]) => LexicalNode;
  isCodeBlockNode: (node: LexicalNode | null | undefined) => boolean;
  /** 显式语言标记规范化；默认仅 toLowerCase（服务端行为） */
  normalizeLangHint?: (langHint: string | undefined) => string;
  /** 无显式标记时的语言补全；默认直接回退 text（服务端无 highlight.js） */
  detectLanguage?: (code: string, name?: string) => string;
}

export function createCodeBlockTransformers(
  deps: CodeBlockTransformersDeps,
): MultilineElementTransformer[] {
  const normalizeLangHint =
    deps.normalizeLangHint ?? ((langHint: string | undefined) => (langHint ?? '').toLowerCase());
  const detectLanguage = deps.detectLanguage ?? (() => 'text');

  /** 解析单个围栏起始行（组内解析用），不匹配返回 null */
  const parseFenceStart = (line: string): { lang: string; name?: string } | null => {
    const match = line.match(FENCE_START_REGEX);
    if (!match) return null;
    return { lang: normalizeLangHint(match[2]), name: match[3] };
  };

  /** 把若干行解析成文件列表：识别其中的围栏，围栏外的内容忽略 */
  const parseFencedFiles = (lines: string[]): CodeFile[] => {
    const files: CodeFile[] = [];
    let current: { lang: string; name?: string; lines: string[] } | null = null;

    const commit = () => {
      if (!current) return;
      const code = current.lines.join('\n').replace(/\s+$/, '');
      files.push({
        name: current.name,
        language: current.lang || detectLanguage(code, current.name),
        code,
      });
      current = null;
    };

    for (const line of lines) {
      if (current) {
        if (/^[ \t]*`{3,}[ \t]*$/.test(line)) {
          commit();
        } else {
          current.lines.push(line);
        }
        continue;
      }
      const start = parseFenceStart(line);
      if (start) {
        current = { ...start, lines: [] };
      }
    }
    commit(); // 未闭合的围栏也收下
    return files;
  };

  /** 单个围栏转换器（含可选 [name] 信息串） */
  const fencedCodeTransformer: MultilineElementTransformer = {
    type: 'multiline-element',
    dependencies: [deps.CodeBlockNode],
    regExpStart: FENCE_START_REGEX,
    regExpEnd: { optional: true, regExp: /^[ \t]*`{3,}[ \t]*$/ },

    export: (node: LexicalNode) => {
      if (!deps.isCodeBlockNode(node)) return null;
      const files = (node as CodeBlockNode).getFiles();
      // 多文件交给 code-group 导出；这里只处理单文件
      if (files.length !== 1) return null;
      return fileToMarkdown(files[0]);
    },

    replace: (
      rootNode: ElementNode,
      children: LexicalNode[] | null,
      startMatch: string[],
      _endMatch: string[] | null,
      linesInBetween: string[] | null,
      isImport: boolean,
    ) => {
      const lang = normalizeLangHint(startMatch[2]);
      const name = startMatch[3];

      // 导入：linesInBetween[0] 是起始行剩余部分，空白则丢弃
      if (!children && linesInBetween) {
        const lines = [...linesInBetween];
        if (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
        while (lines.length > 0 && lines[lines.length - 1].length === 0) lines.pop();
        const code = lines.join('\n');
        rootNode.append(
          deps.createCodeBlockNode([{ name, language: lang || detectLanguage(code, name), code }]),
        );
        return true;
      }

      if (children) {
        // 输入快捷键：把当前段落替换成空代码块，光标落到后面的新段落（空块不做内容检测）
        if (!isImport) {
          const node = deps.createCodeBlockNode([{ name, language: lang || 'text', code: '' }]);
          rootNode.replace(node);
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
        }
        return true;
      }
      return false;
    },
  };

  /** :::code-group 多文件容器转换器 */
  const codeGroupTransformer: MultilineElementTransformer = {
    type: 'multiline-element',
    dependencies: [deps.CodeBlockNode],
    regExpStart: GROUP_START_REGEX,
    regExpEnd: { optional: true, regExp: GROUP_END_REGEX },

    export: (node: LexicalNode) => {
      if (!deps.isCodeBlockNode(node)) return null;
      const files = (node as CodeBlockNode).getFiles();
      if (files.length <= 1) return null;
      return `:::code-group\n${files.map(fileToMarkdown).join('\n')}\n:::`;
    },

    replace: (
      rootNode: ElementNode,
      _children: LexicalNode[] | null,
      _startMatch: string[],
      _endMatch: string[] | null,
      linesInBetween: string[] | null,
      _isImport: boolean,
    ) => {
      if (!linesInBetween) return false; // code-group 不参与输入快捷键
      const lines = [...linesInBetween];
      if (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
      while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) lines.pop();
      const files = parseFencedFiles(lines);
      if (files.length === 0) return false;
      rootNode.append(deps.createCodeBlockNode(files));
      return true;
    },
  };

  /**
   * 代码块转换器集合：code-group 在前，避免组起始行被单围栏规则误吞
   * （实际两者的起始正则互不重叠，顺序只是保险）。
   */
  return [codeGroupTransformer, fencedCodeTransformer];
}

/** headless 默认绑定（零 React 节点，无内容语言检测） */
export const CODE_BLOCK_TRANSFORMERS: MultilineElementTransformer[] = createCodeBlockTransformers({
  CodeBlockNode: HeadlessCodeBlockNode,
  createCodeBlockNode: $createCodeBlockNode,
  isCodeBlockNode: $isCodeBlockNode,
});

import { $createParagraphNode, type ElementNode, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import { $createCodeBlockNode, $isCodeBlockNode, CodeBlockNode, type CodeFile } from './CodeBlockNode';
import { detectLanguageFromContent, languageFromFilename, normalizeLanguage } from './languages';

/**
 * 代码块 Markdown 往返。
 *
 * 导出格式：
 * - 单文件且无文件名：标准围栏 ```lang
 * - 单文件带文件名：```lang [name]
 * - 多文件：:::code-group 容器包裹多个围栏（VuePress 约定，降级可读）
 *
 * 导入时语言缺失会依次尝试文件名扩展名与内容检测（highlight.js）。
 * 服务端 core 内有一份同构副本（不带内容检测），格式需保持一致。
 */

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

/** 解析单个围栏起始行（组内解析用），不匹配返回 null */
function parseFenceStart(line: string): { lang: string; name?: string } | null {
  const match = line.match(FENCE_START_REGEX);
  if (!match) return null;
  return { lang: normalizeLanguage(match[2]), name: match[3] };
}

/** 把若干行解析成文件列表：识别其中的围栏，围栏外的内容忽略 */
function parseFencedFiles(lines: string[]): CodeFile[] {
  const files: CodeFile[] = [];
  let current: { lang: string; name?: string; lines: string[] } | null = null;

  const commit = () => {
    if (!current) return;
    const code = current.lines.join('\n').replace(/\s+$/, '');
    files.push({
      name: current.name,
      language: current.lang || languageFromFilename(current.name) || detectLanguageFromContent(code) || 'text',
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
}

function $appendCodeBlock(rootNode: ElementNode, files: CodeFile[]): void {
  rootNode.append($createCodeBlockNode(files.length > 0 ? files : [{ code: '' }]));
}

/** 单个围栏转换器（含可选 [name] 信息串） */
const fencedCodeTransformer: MultilineElementTransformer = {
  type: 'multiline-element',
  dependencies: [CodeBlockNode],
  regExpStart: FENCE_START_REGEX,
  regExpEnd: { optional: true, regExp: /^[ \t]*`{3,}[ \t]*$/ },

  export: (node: LexicalNode) => {
    if (!$isCodeBlockNode(node)) return null;
    const files = node.getFiles();
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
    const lang = normalizeLanguage(startMatch[2]);
    const name = startMatch[3];

    // 导入：linesInBetween[0] 是起始行剩余部分，空白则丢弃
    if (!children && linesInBetween) {
      const lines = [...linesInBetween];
      if (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
      while (lines.length > 0 && lines[lines.length - 1].length === 0) lines.pop();
      const code = lines.join('\n');
      $appendCodeBlock(rootNode, [
        {
          name,
          language: lang || languageFromFilename(name) || detectLanguageFromContent(code) || 'text',
          code,
        },
      ]);
      return true;
    }

    // 输入快捷键：把当前段落替换成空代码块，光标落到后面的新段落
    if (children) {
      if (!isImport) {
        const node = $createCodeBlockNode([{ name, language: lang || 'text', code: '' }]);
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
  dependencies: [CodeBlockNode],
  regExpStart: GROUP_START_REGEX,
  regExpEnd: { optional: true, regExp: GROUP_END_REGEX },

  export: (node: LexicalNode) => {
    if (!$isCodeBlockNode(node)) return null;
    const files = node.getFiles();
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
    $appendCodeBlock(rootNode, files);
    return true;
  },
};

/**
 * 代码块转换器集合：code-group 在前，避免组起始行被单围栏规则误吞
 * （实际两者的起始正则互不重叠，顺序只是保险）。
 */
export const CODE_BLOCK_TRANSFORMERS: MultilineElementTransformer[] = [
  codeGroupTransformer,
  fencedCodeTransformer,
];

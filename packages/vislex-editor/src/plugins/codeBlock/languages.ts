import hljs from 'highlight.js/lib/common';

/**
 * 文件名扩展名 → shiki 语言 id。
 * 确定性最高，优先于内容检测。
 */
const EXT_TO_LANG: Record<string, string> = {
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'jsx',
  ts: 'typescript', mts: 'typescript', cts: 'typescript', tsx: 'tsx',
  py: 'python', pyw: 'python',
  java: 'java', kt: 'kotlin', kts: 'kotlin', scala: 'scala',
  c: 'c', h: 'c',
  cc: 'cpp', cpp: 'cpp', cxx: 'cpp', hpp: 'cpp', hh: 'cpp',
  cs: 'csharp',
  go: 'go', rs: 'rust', rb: 'ruby', php: 'php', swift: 'swift',
  m: 'objective-c', mm: 'objective-c',
  sh: 'bash', bash: 'bash', zsh: 'bash', fish: 'fish',
  ps1: 'powershell', psm1: 'powershell',
  json: 'json', jsonc: 'jsonc', json5: 'json5',
  yml: 'yaml', yaml: 'yaml', toml: 'toml', ini: 'ini',
  xml: 'xml', html: 'html', htm: 'html', xhtml: 'html',
  vue: 'vue', svelte: 'svelte', astro: 'astro',
  css: 'css', scss: 'scss', sass: 'sass', less: 'less', styl: 'stylus',
  md: 'markdown', mdx: 'mdx',
  sql: 'sql', prisma: 'prisma', graphql: 'graphql', gql: 'graphql',
  dockerfile: 'dockerfile', docker: 'dockerfile',
  makefile: 'makefile', mk: 'makefile', cmake: 'cmake',
  nginx: 'nginx', conf: 'nginx',
  lua: 'lua', pl: 'perl', r: 'r', dart: 'dart', ex: 'elixir', exs: 'elixir',
  erl: 'erlang', hs: 'haskell', clj: 'clojure', tf: 'hcl', hcl: 'hcl',
  diff: 'diff', patch: 'diff',
  tex: 'latex', bib: 'bibtex',
  csv: 'csv', env: 'dotenv',
};

/** highlight.js 语言名 → shiki 语言 id 的差异映射（同名则无需出现） */
const HLJS_TO_SHIKI: Record<string, string> = {
  shell: 'bash',
  plaintext: 'text',
  'objectivec': 'objective-c',
  'python-repl': 'python',
  'php-template': 'php',
  vim: 'viml',
  ini: 'ini',
  wasm: 'text',
};

/** 内容检测允许产出的语言子集（限定在常见语言内，降低误判率） */
const DETECT_SUBSET = [
  'bash', 'c', 'cpp', 'csharp', 'css', 'diff', 'go', 'graphql', 'ini', 'java',
  'javascript', 'json', 'kotlin', 'lua', 'makefile', 'markdown', 'nginx',
  'objectivec', 'perl', 'php', 'plaintext', 'python', 'r', 'ruby', 'rust',
  'scss', 'shell', 'sql', 'swift', 'typescript', 'xml', 'yaml',
];

/** 别名归一：把常见别名统一成 shiki 语言 id */
const LANG_ALIASES: Record<string, string> = {
  'c++': 'cpp', 'c#': 'csharp', 'f#': 'fsharp',
  js: 'javascript', ts: 'typescript',
  'objective-c': 'objective-c', objc: 'objective-c',
  sh: 'bash', shell: 'bash', zsh: 'bash', console: 'bash',
  'objective-c++': 'objective-cpp',
  py: 'python', rb: 'ruby', yml: 'yaml',
  'golang': 'go', md: 'markdown', plaintext: 'text', txt: 'text', text: 'text',
  'vim': 'viml', docker: 'dockerfile', gql: 'graphql', 'cjs': 'javascript', 'mjs': 'javascript',
};

export function normalizeLanguage(lang: string | null | undefined): string {
  if (!lang) return '';
  const key = lang.trim().toLowerCase();
  if (!key) return '';
  return LANG_ALIASES[key] ?? key;
}

/** 由文件名推导语言（无扩展名时返回空串） */
export function languageFromFilename(name: string | null | undefined): string {
  if (!name) return '';
  const base = name.trim().toLowerCase();
  if (!base) return '';
  // 无扩展名的特殊文件名
  if (base === 'dockerfile') return 'dockerfile';
  if (base === 'makefile') return 'makefile';
  const dot = base.lastIndexOf('.');
  if (dot === -1 || dot === base.length - 1) return '';
  return EXT_TO_LANG[base.slice(dot + 1)] ?? '';
}

/**
 * 基于内容做语言自动检测（highlight.js auto-detect）。
 * 短文本或低置信度时返回空串，交给调用方回退为 text。
 */
export function detectLanguageFromContent(code: string): string {
  const trimmed = code.trim();
  if (trimmed.length < 20) return '';
  try {
    const result = hljs.highlightAuto(trimmed, DETECT_SUBSET);
    const lang = result.language;
    if (!lang || (result.relevance ?? 0) < 10) return '';
    return HLJS_TO_SHIKI[lang] ?? normalizeLanguage(lang);
  } catch {
    return '';
  }
}

/**
 * 综合语言检测：显式指定 > 文件名扩展名 > 内容检测 > text。
 */
export function resolveLanguage(file: { name?: string; language?: string; code: string }): string {
  const explicit = normalizeLanguage(file.language);
  if (explicit) return explicit;
  const fromName = languageFromFilename(file.name);
  if (fromName) return fromName;
  const fromContent = detectLanguageFromContent(file.code);
  if (fromContent) return fromContent;
  return 'text';
}

/** 编辑器里可选的常见语言列表（模态窗口 datalist 用） */
export const COMMON_LANGUAGES = [
  'bash', 'c', 'cpp', 'csharp', 'css', 'diff', 'dockerfile', 'go', 'graphql',
  'html', 'ini', 'java', 'javascript', 'json', 'jsonc', 'jsx', 'kotlin', 'lua',
  'makefile', 'markdown', 'mdx', 'nginx', 'objective-c', 'perl', 'php',
  'powershell', 'prisma', 'python', 'r', 'ruby', 'rust', 'scss', 'sql',
  'svelte', 'swift', 'toml', 'tsx', 'typescript', 'vue', 'xml', 'yaml',
];

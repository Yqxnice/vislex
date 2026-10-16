import { createHighlighter, type BundledLanguage, type Highlighter } from 'shiki';

/**
 * shiki 高亮模块：单例 Highlighter + 结果缓存。
 *
 * 双主题策略：codeToHtml 传入 light/dark 两个主题并关闭 defaultColor，
 * 生成的 HTML 不带具体颜色，只在每个 span 上输出 --shiki-light / --shiki-dark
 * 两个 CSS 变量；实际颜色由 styles.css 根据 .dark 祖先类切换（与 vislex 的
 * 暗色方案一致，无需 JS 参与主题切换）。
 */

const LIGHT_THEME = 'github-light';
const DARK_THEME = 'github-dark';

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [LIGHT_THEME, DARK_THEME],
      langs: [],
    });
  }
  return highlighterPromise;
}

/** 语言加载失败的缓存，避免重复尝试不存在的语法 */
const failedLangs = new Set<string>();

async function ensureLanguage(highlighter: Highlighter, lang: string): Promise<string> {
  if (!lang || lang === 'text' || lang === 'plain' || lang === 'plaintext') return 'text';
  if (failedLangs.has(lang)) return 'text';
  if (!highlighter.getLoadedLanguages().includes(lang)) {
    try {
      await highlighter.loadLanguage(lang as BundledLanguage);
    } catch {
      failedLangs.add(lang);
      return 'text';
    }
  }
  return lang;
}

/** 高亮结果缓存：key 为 语言 + 内容，容量有界 */
const MAX_CACHE = 200;
const htmlCache = new Map<string, string>();

function cacheKey(lang: string, code: string): string {
  return `${lang}￿${code.length}￿${code}`;
}

/**
 * 把一段代码高亮成带双主题 CSS 变量的 HTML 字符串。
 * 任何失败（语法缺失、wasm 异常等）都回退为 null，由调用方渲染纯文本。
 */
export async function highlightCode(code: string, lang: string): Promise<string | null> {
  const key = cacheKey(lang, code);
  const cached = htmlCache.get(key);
  if (cached !== undefined) return cached;

  try {
    const highlighter = await getHighlighter();
    const resolved = await ensureLanguage(highlighter, lang);
    if (resolved === 'text') return null; // text 直接走纯文本渲染，不浪费 shiki
    const html = highlighter.codeToHtml(code, {
      lang: resolved,
      themes: { light: LIGHT_THEME, dark: DARK_THEME },
      defaultColor: false,
    });
    if (htmlCache.size >= MAX_CACHE) {
      htmlCache.delete(htmlCache.keys().next().value as string);
    }
    htmlCache.set(key, html);
    return html;
  } catch {
    return null;
  }
}

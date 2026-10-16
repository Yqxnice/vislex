import katex from 'katex';
import 'katex/dist/katex.min.css';
import { fallback } from './katex.css';

/**
 * 把 LaTeX 公式渲染成 HTML 字符串（与编辑器 katex.ts 同源）。
 * 失败时回退到纯文本展示，不抛错打断渲染。
 */
export function renderMath(equation: string, displayMode: boolean): string {
  if (!equation.trim()) {
    return `<span class="${fallback}">${displayMode ? '空公式' : '∅'}</span>`;
  }
  try {
    return katex.renderToString(equation, {
      displayMode,
      throwOnError: false,
      output: 'html',
      trust: false,
      strict: false,
    });
  } catch {
    return `<span class="${fallback}">${equation}</span>`;
  }
}

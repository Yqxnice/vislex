import type { EditorThemeClasses } from 'lexical';

/**
 * 基础主题：Lexical 节点 → Tailwind 工具类字符串。
 * 颜色走 vl-* token（桥接 --vislex-* 变量），暗色由 .dark 祖先类翻转变量值。
 */
export const baseTheme: EditorThemeClasses = {
  paragraph: 'mb-2 last:mb-0',
  heading: {
    h1: 'mt-[18px] mb-2.5 text-[1.5em] leading-[1.35] font-semibold',
    h2: 'mt-4 mb-2 text-[1.25em] leading-[1.4] font-semibold',
    h3: 'mt-3.5 mb-2 text-[1.1em] font-semibold',
  },
  quote: 'my-2.5 border-l-[3px] border-vl-border-strong pl-3 text-vl-text-muted',
  list: {
    ul: 'my-2 list-disc pl-[22px]',
    ol: 'my-2 list-decimal pl-[22px]',
    listitem: 'my-0.5',
  },
  text: {
    bold: 'font-semibold',
    italic: 'italic',
    strikethrough: 'line-through',
    code: 'rounded bg-vl-code-bg px-[5px] py-px font-mono text-[0.9em]',
  },
  link: 'cursor-pointer text-vl-brand underline',
};

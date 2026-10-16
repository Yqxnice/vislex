import type { EditorThemeClasses } from 'lexical';

import * as css from './theme.css';

/**
 * 基础主题：Lexical 节点 → VE 类名（theme.css.ts）。
 * 颜色走 style-token vars（--vislex-* 变量），暗色由 .dark 祖先类翻转变量值。
 */
export const baseTheme: EditorThemeClasses = {
  paragraph: css.paragraph,
  heading: {
    h1: css.headingH1,
    h2: css.headingH2,
    h3: css.headingH3,
  },
  quote: css.quote,
  list: {
    ul: css.listUl,
    ol: css.listOl,
    listitem: css.listitem,
  },
  text: {
    bold: css.textBold,
    italic: css.textItalic,
    strikethrough: css.textStrikethrough,
    code: css.textCode,
  },
  link: css.link,
};

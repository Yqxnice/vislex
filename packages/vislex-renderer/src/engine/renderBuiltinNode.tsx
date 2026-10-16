import { bannerClasses, baseTheme, tableCellClass, tableCellHeaderClass, tableClass } from '@vislex/editor/static';
import type { CSSProperties, ReactNode } from 'react';

/**
 * 内置节点（非 DecoratorNode、非 text）渲染：
 * paragraph/heading/quote/list/listitem/link/table/tablerow/tablecell/linebreak/banner。
 * 元素 format（对齐）→ text-align 行内样式，与编辑器 reconciler 行为一致。
 */

function alignStyle(node: any): CSSProperties | undefined {
  return node.format ? ({ textAlign: node.format } as CSSProperties) : undefined;
}

function textToSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replaceAll(/[^\s\w一-鿿가-힯＀-￯-]/g, '')
      .replaceAll(/[\s_]+/g, '-')
      .replaceAll(/^-+|-+$/g, '')
  );
}

function extractText(node: any): string {
  if (node.text) return node.text;
  if (node.children) return node.children.map(extractText).join('');
  return '';
}

export function renderBuiltinNode(
  node: any,
  key: string,
  children: ReactNode[] | null,
  headingSlugs: Map<string, number>,
  textContent?: string,
): ReactNode {
  switch (node.type) {
    case 'root': {
      return <>{children}</>;
    }
    case 'paragraph': {
      return (
        <p className={baseTheme.paragraph} key={key} style={alignStyle(node)}>
          {children ?? <br />}
        </p>
      );
    }
    case 'heading': {
      const Tag = node.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const headingClasses: Record<string, string | undefined> = {
        h1: baseTheme.heading?.h1,
        h2: baseTheme.heading?.h2,
        h3: baseTheme.heading?.h3,
      };
      // 标题 id slug：为文章 TOC/锚点定位提供稳定 id（编辑器内不可见，无副作用）
      const text = textContent || extractText(node);
      const baseSlug = textToSlug(text);
      let slug = baseSlug;
      if (baseSlug) {
        const count = headingSlugs.get(baseSlug);
        if (count !== undefined) {
          slug = `${baseSlug}-${count}`;
          headingSlugs.set(baseSlug, count + 1);
        } else {
          headingSlugs.set(baseSlug, 1);
        }
      }
      return (
        <Tag className={headingClasses[Tag]} id={slug || undefined} key={key} style={alignStyle(node)}>
          {children}
        </Tag>
      );
    }
    case 'quote': {
      return (
        <blockquote className={baseTheme.quote} key={key} style={alignStyle(node)}>
          {children}
        </blockquote>
      );
    }
    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul';
      const cls = node.listType === 'number' ? baseTheme.list?.ol : baseTheme.list?.ul;
      return (
        <Tag className={cls} key={key} start={node.start !== 1 ? node.start : undefined}>
          {children}
        </Tag>
      );
    }
    case 'listitem': {
      const value = typeof node.value === 'number' && node.value > 1 ? node.value : undefined;
      return (
        <li className={baseTheme.list?.listitem} key={key} value={value}>
          {children}
        </li>
      );
    }
    case 'link': {
      return (
        <a
          className={baseTheme.link}
          href={node.url}
          key={key}
          rel={node.rel || 'noopener'}
          target={node.target || '_blank'}
        >
          {children}
        </a>
      );
    }
    case 'table': {
      // React 渲染不允许 <tr> 直接挂在 <table> 下（validateDOMNesting 告警），
      // 显式包一层 tbody——浏览器解析 HTML 时本就会自动补，视觉与编辑器一致
      return (
        <table className={tableClass} key={key}>
          <tbody>{children}</tbody>
        </table>
      );
    }
    case 'tablerow': {
      return <tr key={key}>{children}</tr>;
    }
    case 'tablecell': {
      const CellTag = node.headerState ? 'th' : 'td';
      const cls = node.headerState ? `${tableCellClass} ${tableCellHeaderClass}` : tableCellClass;
      return (
        <CellTag
          className={cls}
          colSpan={node.colSpan > 1 ? node.colSpan : undefined}
          key={key}
          rowSpan={node.rowSpan > 1 ? node.rowSpan : undefined}
        >
          {children}
        </CellTag>
      );
    }
    case 'linebreak': {
      return <br key={key} />;
    }
    case 'banner': {
      const variant = (node.variant as keyof typeof bannerClasses) || 'info';
      return (
        <div className={bannerClasses[variant] ?? bannerClasses.info} key={key}>
          {children}
        </div>
      );
    }
    default: {
      return null;
    }
  }
}

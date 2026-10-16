import { baseTheme, mentionNodeClass } from '@vislex/editor/static';
import type { CSSProperties, ReactNode } from 'react';

/**
 * 文本节点渲染：format 位掩码 → 嵌套格式元素。
 * bold/italic/strikethrough/code 用 baseTheme 的 VE 类（与编辑器同源），
 * underline/subscript/superscript 编辑器 UI 不产生，用语义标签兜底。
 * mention（TextNode 子类）也在此渲染：最外层套 mention 高亮类。
 */

const theme = baseTheme.text!;

const FORMAT_FLAGS: [number, string][] = [
  [1, theme.bold!],
  [2, theme.italic!],
  [4, theme.strikethrough!],
  [16, theme.code!],
];

function parseCSSText(cssText: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const part of cssText.split(';')) {
    const colonIndex = part.indexOf(':');
    if (colonIndex === -1) continue;
    const prop = part.slice(0, colonIndex).trim();
    const value = part.slice(colonIndex + 1).trim();
    if (!prop || !value) continue;
    const camelProp = prop.replaceAll(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    style[camelProp] = value;
  }
  return style as CSSProperties;
}

export function renderTextNode(node: any, key: string): ReactNode {
  let element: ReactNode = node.text;
  const format = node.format || 0;

  for (const [flag, className] of FORMAT_FLAGS) {
    if (format & flag) {
      element = (
        <span className={className} key={`${key}-${flag}`}>
          {element}
        </span>
      );
    }
  }
  if (format & 8) {
    element = <u key={`${key}-u`}>{element}</u>;
  }
  if (format & 32) {
    element = <sub key={`${key}-sub`}>{element}</sub>;
  }
  if (format & 64) {
    element = <sup key={`${key}-sup`}>{element}</sup>;
  }

  if (node.style) {
    element = (
      <span key={`${key}-style`} style={parseCSSText(node.style)}>
        {element}
      </span>
    );
  }

  if (node.type === 'mention') {
    element = (
      <span className={mentionNodeClass} data-mention-id={node.mentionId || undefined} key={key}>
        {element}
      </span>
    );
  }

  return element;
}

import { allNodes, baseTheme, RendererConfigProvider } from '@vislex/editor/static';
import { createHeadlessEditor } from '@lexical/headless';
import type { LexicalEditor, SerializedEditorState } from 'lexical';
import { $getRoot } from 'lexical';
import { cloneElement, isValidElement, useMemo, type ReactNode } from 'react';

import { renderBuiltinNode } from './engine/renderBuiltinNode.js';
import { renderTextNode } from './engine/renderTextNode.js';
import type { BuiltinNodeRenderer, RichRendererProps } from './types.js';

interface EditorConfig {
  namespace: string;
  theme: Record<string, any>;
}

interface RenderOptions {
  builtinNodeOverrides?: Record<string, BuiltinNodeRenderer>;
}

function wrapDecoration(_serialized: any, key: string, decoration: ReactNode): ReactNode {
  if (isValidElement(decoration)) {
    return cloneElement(decoration, { key });
  }
  return decoration;
}

function renderTree(
  node: any,
  editor: LexicalEditor,
  editorConfig: EditorConfig,
  headingSlugs: Map<string, number>,
  key: string,
  options: RenderOptions,
): ReactNode {
  const nodeKey = node.getKey ? node.getKey() : key;
  const { builtinNodeOverrides } = options;

  // DecoratorNode：走节点 decorate（内部经 RendererWrapper 从 RendererConfig 取槽位组件）
  if (typeof node.decorate === 'function') {
    let decoration: ReactNode = null;
    try {
      decoration = node.decorate(editor, editorConfig);
    } catch {
      /* decorate 失败回退内置渲染 */
    }
    if (decoration != null) {
      const serialized = node.exportJSON ? node.exportJSON() : {};
      const override = builtinNodeOverrides?.[serialized.type];
      const wrapped = override
        ? override(serialized, nodeKey, [decoration], () =>
            wrapDecoration(serialized, nodeKey, decoration),
          )
        : wrapDecoration(serialized, nodeKey, decoration);
      return wrapped;
    }
  }

  const serialized = node.exportJSON ? node.exportJSON() : {};

  // 文本类节点（text + mention 等 TextNode 子类）
  if (serialized.type === 'text' || serialized.type === 'mention') {
    const override = builtinNodeOverrides?.[serialized.type];
    if (override) {
      return override(serialized, nodeKey, null, () => renderTextNode(serialized, nodeKey));
    }
    return renderTextNode(serialized, nodeKey);
  }

  const childNodes: any[] = typeof node.getChildren === 'function' ? node.getChildren() : [];

  // Lexical 的 ElementNode.exportJSON() 返回 children: []——子节点不内嵌进序列化输出。
  // 从活节点补回最小 type 信息，让下游结构性判断（如嵌套列表检测）可行。
  if (
    Array.isArray(serialized.children) &&
    serialized.children.length === 0 &&
    childNodes.length > 0
  ) {
    serialized.children = childNodes.map((c: any) => ({
      type: typeof c.getType === 'function' ? c.getType() : c.__type,
    }));
  }

  let children: ReactNode[] | null = null;
  if (childNodes.length > 0) {
    children = childNodes.map((child: any, i: number) =>
      renderTree(child, editor, editorConfig, headingSlugs, `${nodeKey}-${i}`, options),
    );
  }

  const textContent = node.getTextContent ? node.getTextContent() : undefined;

  const override = builtinNodeOverrides?.[serialized.type];
  if (override) {
    const defaultRenderer = () =>
      renderBuiltinNode(serialized, nodeKey, children, headingSlugs, textContent);
    return override(serialized, nodeKey, children, defaultRenderer);
  }

  return renderBuiltinNode(serialized, nodeKey, children, headingSlugs, textContent);
}

function renderEditorToReact(value: SerializedEditorState, options: RenderOptions): ReactNode {
  const editor = createHeadlessEditor({
    nodes: allNodes,
    theme: baseTheme,
    editable: false,
    onError: (error: Error) => {
      console.error('[RichRenderer]', error);
    },
  });

  const editorConfig: EditorConfig = { namespace: 'vislex-renderer', theme: baseTheme };

  const editorState = editor.parseEditorState(value);
  editor.setEditorState(editorState);

  let content: ReactNode = null;
  editorState.read(() => {
    const root = $getRoot();
    const headingSlugs = new Map<string, number>();
    const children = root
      .getChildren()
      .map((child: any, i: number) =>
        renderTree(child, editor, editorConfig, headingSlugs, `ssr-${i}`, options),
      );
    content = <>{children}</>;
  });
  return content;
}

/**
 * RichRenderer：不加载编辑器运行时，将 EditorState JSON 渲染为只读 React 树。
 * - 装饰器节点经 RendererConfig 槽位解析（composeRenderer 注入，缺槽渲染 null）；
 * - 暗色由宿主 .dark 祖先类翻转变量值，本组件不感知主题。
 */
export function RichRenderer({
  value,
  rendererConfig,
  builtinNodeOverrides,
  className,
  style,
  as: Component = 'div',
}: RichRendererProps) {
  const content = useMemo(
    () => renderEditorToReact(value, { builtinNodeOverrides }),
    [value, builtinNodeOverrides],
  );

  const classes = ['vislex-renderer', className].filter(Boolean).join(' ');

  return (
    <RendererConfigProvider config={rendererConfig}>
      <Component className={classes} style={style}>
        {content}
      </Component>
    </RendererConfigProvider>
  );
}

import type { RendererConfig } from '@vislex/editor/static';
import type { SerializedEditorState } from 'lexical';
import type { ComponentType, CSSProperties, ElementType, ReactNode } from 'react';

/**
 * 内置节点渲染器（对标 haklex BuiltinNodeRenderer）：
 * 通过 builtinNodeOverrides 按节点 type 覆盖默认渲染；
 * defaultRenderer 回调可产出默认结果（用于包装/增强而非全量重写）。
 */
export type BuiltinNodeRenderer = (
  node: any,
  key: string,
  children: ReactNode[] | null,
  defaultRenderer: () => ReactNode,
) => ReactNode;

/**
 * 渲染端模块契约：renderer-* 包各自导出一个模块，
 * composeRenderer 聚合全部模块的槽位组件 / 内置节点覆盖 / Provider。
 */
export interface VislexRendererModule {
  name: string;
  /** 装饰器节点渲染槽（RendererConfig 切片） */
  renderers?: RendererConfig;
  /** 内置节点渲染覆盖 */
  builtinNodes?: Record<string, BuiltinNodeRenderer>;
  /** 渲染期需要的 context Provider（如主题/数据注入） */
  Provider?: ComponentType<{ children: ReactNode }>;
}

export interface RichRendererProps {
  /** Lexical EditorState JSON */
  value: SerializedEditorState;
  /** 装饰器节点渲染槽配置（compose 产物） */
  rendererConfig?: RendererConfig;
  /** 内置节点渲染覆盖 */
  builtinNodeOverrides?: Record<string, BuiltinNodeRenderer>;
  className?: string;
  style?: CSSProperties;
  /** 容器元素，默认 div */
  as?: ElementType;
}

/** composeRenderer 产物的 props（槽位/覆盖已固化在闭包里） */
export type RichRendererBaseProps = Omit<RichRendererProps, 'rendererConfig' | 'builtinNodeOverrides'>;

export interface ComposeRendererOptions {
  /** 预设模块（先于 modules 合并，@vislex/renderer 聚合预设走这里） */
  preset?: VislexRendererModule[];
  /** 追加模块（同名槽位后者覆盖前者） */
  modules?: VislexRendererModule[];
  /** 槽位覆盖（优先级最高） */
  overrides?: RendererConfig;
  /** 内置节点覆盖（优先级最高） */
  builtinNodeOverrides?: Record<string, BuiltinNodeRenderer>;
}

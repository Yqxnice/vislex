import type { ComponentType, ReactElement } from 'react';
import { createElement } from 'react';

import type { RendererConfig } from './RendererConfig.js';
import { useRendererConfig } from './RendererConfigContext.js';

export type RendererKey = keyof RendererConfig;

type RendererPropsByKey = {
  [K in RendererKey]-?: NonNullable<RendererConfig[K]> extends ComponentType<infer P extends object>
    ? P
    : never;
};

type RendererComponentByKey = {
  [K in RendererKey]-?: NonNullable<RendererConfig[K]> extends ComponentType<any>
    ? NonNullable<RendererConfig[K]>
    : never;
};

export type RendererWrapperProps = {
  [K in RendererKey]-?: {
    /** RendererConfig 中的槽位名 */
    rendererKey: K;
    /**
     * 默认渲染组件，可选——缺省时槽位仅经 RendererConfig context 解析；
     * 既无注入也无默认时渲染 null。需要保持包体轻量的节点应省略它，
     * 把重渲染器留在独立子路径/包中，compose 时再注册进 RendererConfig。
     */
    defaultRenderer?: RendererComponentByKey[K];
    /** 传给渲染组件的 props */
    props: RendererPropsByKey[K];
  };
}[RendererKey];

/**
 * 渲染槽解析组件：优先取 RendererConfig context 中的注入组件，
 * 其次回退 defaultRenderer，二者都无则渲染 null。
 */
export function RendererWrapper({ rendererKey, defaultRenderer, props }: RendererWrapperProps) {
  const config = useRendererConfig();
  const Renderer: ComponentType<any> | undefined = config?.[rendererKey] ?? defaultRenderer;

  if (!Renderer) return null;

  return <Renderer {...props} />;
}

/**
 * 供 .ts 节点文件使用的类型安全 helper：以 createElement 产出 RendererWrapper 元素，
 * 规避 createElement + 判别联合的类型限制。
 *
 * static 节点一律传 `defaultRenderer = undefined`：重依赖（shiki/katex/mermaid）
 * 由 renderer-* 包在 compose 时注入 RendererConfig，节点包保持轻量。
 */
export function createRendererDecoration<K extends RendererKey>(
  rendererKey: K,
  defaultRenderer: RendererComponentByKey[K] | undefined,
  props: RendererPropsByKey[K],
): ReactElement {
  return createElement(RendererWrapper, {
    rendererKey,
    defaultRenderer,
    props,
  } as RendererWrapperProps);
}

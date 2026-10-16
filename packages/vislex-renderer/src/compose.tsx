import type { RendererConfig } from '@vislex/editor/static';
import { Fragment, memo, type ComponentType, type ReactNode } from 'react';

import { RichRenderer } from './RichRenderer.js';
import type {
  BuiltinNodeRenderer,
  ComposeRendererOptions,
  RichRendererBaseProps,
  VislexRendererModule,
} from './types.js';

function mergeRenderers(modules: VislexRendererModule[]): RendererConfig {
  const out: RendererConfig = {};
  for (const m of modules) {
    if (m.renderers) Object.assign(out, m.renderers);
  }
  return out;
}

function mergeBuiltinNodes(modules: VislexRendererModule[]): Record<string, BuiltinNodeRenderer> {
  const out: Record<string, BuiltinNodeRenderer> = {};
  for (const m of modules) {
    if (m.builtinNodes) Object.assign(out, m.builtinNodes);
  }
  return out;
}

function composeProviders(modules: VislexRendererModule[]): ComponentType<{ children: ReactNode }> {
  const providers = modules
    .map((m) => m.Provider)
    .filter((P): P is ComponentType<{ children: ReactNode }> => Boolean(P));
  if (providers.length === 0) {
    return Fragment as unknown as ComponentType<{ children: ReactNode }>;
  }
  const ComposedProviders: ComponentType<{ children: ReactNode }> = ({ children }) => {
    let acc: ReactNode = children;
    for (let i = providers.length - 1; i >= 0; i--) {
      const P = providers[i];
      acc = <P>{acc}</P>;
    }
    return <>{acc}</>;
  };
  ComposedProviders.displayName = 'VislexComposedProviders';
  return ComposedProviders;
}

/**
 * composeRenderer：聚合 renderer-* 模块为一份渲染配置，
 * 返回固化配置的 RichRenderer 包装组件。
 *
 * 合并优先级：preset 先于 modules，同名槽位后者覆盖前者；
 * overrides / builtinNodeOverrides 优先级最高。
 *
 * ```ts
 * const ArticleRenderer = composeRenderer({
 *   modules: [katexRendererModule, codeBlockRendererModule],
 * })
 * <ArticleRenderer value={post.content} />
 * ```
 */
export function composeRenderer(
  opts: ComposeRendererOptions,
): ComponentType<RichRendererBaseProps> {
  const modules = [...(opts.preset ?? []), ...(opts.modules ?? [])];
  const rendererConfig: RendererConfig = { ...mergeRenderers(modules), ...opts.overrides };
  const builtinNodeOverrides: Record<string, BuiltinNodeRenderer> = {
    ...mergeBuiltinNodes(modules),
    ...opts.builtinNodeOverrides,
  };
  const ComposedProviders = composeProviders(modules);

  function ComposedRenderer(props: RichRendererBaseProps) {
    return (
      <ComposedProviders>
        <RichRenderer
          as={props.as}
          builtinNodeOverrides={builtinNodeOverrides}
          className={props.className}
          rendererConfig={rendererConfig}
          style={props.style}
          value={props.value}
        />
      </ComposedProviders>
    );
  }

  return memo(ComposedRenderer);
}

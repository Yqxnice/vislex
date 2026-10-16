import type { ReactNode } from 'react';
import { createContext, use } from 'react';

import type { RendererConfig } from './RendererConfig.js';

const RendererConfigContext = createContext<RendererConfig | undefined>(undefined);

export interface RendererConfigProviderProps {
  config?: RendererConfig;
  children: ReactNode;
}

/**
 * 渲染槽配置 Provider：RichRenderer 在渲染前注入 compose 产物，
 * static 节点 decorate 产出的 RendererWrapper 从 context 取槽位组件。
 */
export function RendererConfigProvider({ config, children }: RendererConfigProviderProps) {
  return <RendererConfigContext.Provider value={config}>{children}</RendererConfigContext.Provider>;
}

export function useRendererConfig(): RendererConfig | undefined {
  return use(RendererConfigContext);
}

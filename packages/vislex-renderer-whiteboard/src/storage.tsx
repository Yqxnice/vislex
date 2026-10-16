import { createContext, useContext, type ReactNode } from 'react';

/**
 * 白板快照的远端存储适配器。与编辑器 plugins/whiteboard/storage.tsx 同源。
 *
 * vislex 不绑定任何后端接口，由宿主（如 admin）注入实现：
 * - upload：把快照文本传到远端 blob，返回可引用的 URL（静态渲染端不使用）；
 * - load：按 URL 取回快照文本。
 *
 * 未注入时内联策略的白板仍可渲染，远程 / Delta 两种策略会展示错误兜底。
 */
export interface WhiteboardStorage {
  upload(snapshot: string): Promise<string>;
  load(url: string): Promise<string>;
}

const WhiteboardStorageContext = createContext<WhiteboardStorage | null>(null);

export function WhiteboardStorageProvider({
  storage,
  children,
}: {
  storage?: WhiteboardStorage | null;
  children: ReactNode;
}) {
  return (
    <WhiteboardStorageContext.Provider value={storage ?? null}>
      {children}
    </WhiteboardStorageContext.Provider>
  );
}

export function useWhiteboardStorage(): WhiteboardStorage | null {
  return useContext(WhiteboardStorageContext);
}

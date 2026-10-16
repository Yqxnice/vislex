import { createContext, useContext, type ReactNode } from 'react';

/**
 * 视频的远端存储适配器。
 *
 * vislex 不绑定任何后端接口，由宿主（如 admin）注入实现：
 * upload 把本地视频文件传到远端文件服务，返回可引用的 URL。
 *
 * 未注入时仍可通过 URL 手动填写视频地址，仅上传入口被禁用。
 */
export interface VideoStorage {
  upload(file: File): Promise<string>;
}

const VideoStorageContext = createContext<VideoStorage | null>(null);

export function VideoStorageProvider({
  storage,
  children,
}: {
  storage?: VideoStorage | null;
  children: ReactNode;
}) {
  return (
    <VideoStorageContext.Provider value={storage ?? null}>
      {children}
    </VideoStorageContext.Provider>
  );
}

export function useVideoStorage(): VideoStorage | null {
  return useContext(VideoStorageContext);
}

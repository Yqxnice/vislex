import { createContext, useContext, type ReactNode } from 'react';

/**
 * 图库图片的远端存储适配器。
 *
 * vislex 不绑定任何后端接口，由宿主（如 admin）注入实现：
 * upload 把本地文件传到远端对象存储 / 文件服务，返回可引用的 URL。
 *
 * 未注入时仍可通过「添加链接」手动填写图片地址，仅上传入口被禁用。
 */
export interface GalleryStorage {
  upload(file: File): Promise<string>;
}

const GalleryStorageContext = createContext<GalleryStorage | null>(null);

export function GalleryStorageProvider({
  storage,
  children,
}: {
  storage?: GalleryStorage | null;
  children: ReactNode;
}) {
  return (
    <GalleryStorageContext.Provider value={storage ?? null}>
      {children}
    </GalleryStorageContext.Provider>
  );
}

export function useGalleryStorage(): GalleryStorage | null {
  return useContext(GalleryStorageContext);
}

import '@excalidraw/excalidraw/index.css';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { WhiteboardScene } from './scene.js';
import * as css from './whiteboard.css';

interface ExcalidrawCanvasProps {
  scene: WhiteboardScene;
  theme: 'light' | 'dark';
}

/**
 * Excalidraw 只读快照画布（懒加载 chunk，与编辑器 ExcalidrawCanvas 同源裁剪：
 * 固定 viewModeEnabled，去掉编辑态的 onChange 回写）。
 *
 * 该模块只被按需 import，Excalidraw 本体与它的 CSS 都不会进首屏包。
 * initialData 只在挂载时读取一次，所以父组件按数据指纹给本组件加 key 强制重挂载。
 */
export function ExcalidrawCanvas({ scene, theme }: ExcalidrawCanvasProps) {
  const initialData: ExcalidrawInitialDataState = {
    type: 'excalidraw',
    version: scene.version,
    source: scene.source,
    elements: scene.elements as unknown as readonly ExcalidrawElement[],
    appState: scene.appState as ExcalidrawInitialDataState['appState'],
    files: scene.files as unknown as ExcalidrawInitialDataState['files'],
    scrollToContent: true,
  };

  return (
    <div className={css.canvasFull}>
      <Excalidraw initialData={initialData} viewModeEnabled theme={theme} />
    </div>
  );
}

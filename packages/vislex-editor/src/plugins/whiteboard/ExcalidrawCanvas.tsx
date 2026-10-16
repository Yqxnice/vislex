import '@excalidraw/excalidraw/index.css';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawInitialDataState, ExcalidrawProps } from '@excalidraw/excalidraw/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { pickAppState, type WhiteboardElement, type WhiteboardScene } from './scene.js';
import * as css from './whiteboard.css';

type ExcalidrawChangeHandler = NonNullable<ExcalidrawProps['onChange']>;

interface ExcalidrawCanvasProps {
  scene: WhiteboardScene;
  readOnly: boolean;
  theme: 'light' | 'dark';
  onChange: (scene: WhiteboardScene) => void;
}

/**
 * Excalidraw 画布（懒加载 chunk）。
 *
 * 该模块只被按需 import，Excalidraw 本体与它的 CSS 都不会进首屏包。
 * initialData 只在挂载时读取一次，所以父组件按数据指纹给本组件加 key 强制重挂载。
 */
export function ExcalidrawCanvas({ scene, readOnly, theme, onChange }: ExcalidrawCanvasProps) {
  const initialData: ExcalidrawInitialDataState = {
    type: 'excalidraw',
    version: scene.version,
    source: scene.source,
    elements: scene.elements as unknown as readonly ExcalidrawElement[],
    appState: scene.appState as ExcalidrawInitialDataState['appState'],
    files: scene.files as unknown as ExcalidrawInitialDataState['files'],
    scrollToContent: true,
  };

  const handleChange: ExcalidrawChangeHandler = (elements, appState, files) => {
    onChange({
      type: 'excalidraw',
      version: scene.version,
      source: scene.source,
      elements: elements as unknown as WhiteboardElement[],
      // appState 只留视图相关的少量键，选中态等易变数据不进文档
      appState: pickAppState(appState as unknown as Record<string, unknown>),
      files: files as unknown as Record<string, unknown>,
    });
  };

  return (
    <div className={css.canvasFull}>
      <Excalidraw
        initialData={initialData}
        viewModeEnabled={readOnly}
        theme={theme}
        onChange={handleChange}
      />
    </div>
  );
}

import type { WhiteboardMode, WhiteboardRendererProps } from '@vislex/editor/static';
import { Suspense, lazy, useEffect, useState } from 'react';

import * as card from './card.css';
import { parseScene, resolveDeltaScene, type WhiteboardScene } from './scene.js';
import { useWhiteboardStorage } from './storage.js';
import { useDarkMode } from './useDarkMode.js';
import * as css from './whiteboard.css';

// Excalidraw 体积大，仅在渲染白板时按需加载
const ExcalidrawCanvas = lazy(() =>
  import('./ExcalidrawCanvas.js').then((module) => ({ default: module.ExcalidrawCanvas })),
);

/** 三种存储策略在 UI 上的文案（与编辑器 WhiteboardComponent 同源） */
const MODE_META: Array<{ value: WhiteboardMode; label: string; hint: string }> = [
  { value: 'inline', label: '内联', hint: '完整快照直接存在文档里，自包含但体积大' },
  { value: 'remote', label: '远程', hint: '快照上传到远端存储，文档只保留引用 URL' },
  { value: 'delta', label: 'Delta', hint: '基础快照引用 + JSON 差值补丁，增量体积最小' },
];

/** 由节点数据拼出「是否需要重新解析」的指纹 */
function sourceKeyOf(mode: WhiteboardMode, src: string, scene: string, patch: string): string {
  return `${mode}|${src}|${scene.length}|${patch.length}|${scene.slice(0, 64)}|${patch.slice(0, 64)}`;
}

interface ResolvedState {
  /** 解析完成时的数据指纹，作为画布 key 强制重挂载 */
  key: string;
  scene: WhiteboardScene;
}

/**
 * 白板静态渲染器（RendererConfig 的 Whiteboard 槽位）。
 * 与编辑器内静态外观一致：blockWrap > blockCard > 头部标签与策略说明 + 只读 Excalidraw 画布；
 * 三种存储策略（内联 / 远程 / Delta）的解析逻辑与编辑器一致，
 * 远程与 Delta 依赖宿主经 WhiteboardStorageProvider 注入的存储适配器。
 * 策略切换、保存、编辑画布等编辑态能力已全部剥离。
 */
export function WhiteboardRenderer({ mode, scene, src, patch }: WhiteboardRendererProps) {
  const storage = useWhiteboardStorage();
  const dark = useDarkMode();
  const [resolved, setResolved] = useState<ResolvedState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sourceKey = sourceKeyOf(mode, src, scene, patch);

  // 按存储策略解析场景：内联直接解析，远程拉快照，Delta 再叠加差值补丁
  useEffect(() => {
    let cancelled = false;
    const fail = (message: string) => {
      if (cancelled) return;
      setResolved(null);
      setError(message);
    };

    setError(null);

    if (mode === 'inline') {
      setResolved({ key: sourceKey, scene: parseScene(scene) });
      return;
    }
    if (!storage) {
      fail('未配置远端存储，无法加载白板快照');
      return;
    }
    if (!src) {
      fail('白板缺少快照引用');
      return;
    }

    (async () => {
      try {
        const text = await storage.load(src);
        if (cancelled) return;
        const full = mode === 'remote' ? parseScene(text) : resolveDeltaScene(parseScene(text), patch);
        setResolved({ key: sourceKey, scene: full });
      } catch (e) {
        fail(e instanceof Error ? e.message : '白板快照加载失败');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sourceKey, mode, scene, src, patch, storage]);

  const modeHint = MODE_META.find((item) => item.value === mode)?.hint ?? '';

  return (
    <div className={card.blockWrap}>
      <div className={card.blockCard}>
        <div className={css.header}>
          <span className={card.blockLabel}>白板</span>
          <span className={css.modeHint}>{modeHint}</span>
        </div>
        <div className={css.body} data-state={error ? 'error' : 'ready'}>
          {error ? (
            <div className={css.errorMsg}>{error}</div>
          ) : resolved === null ? (
            <div className={css.placeholder}>白板加载中…</div>
          ) : (
            <Suspense fallback={<div className={css.placeholder}>画布加载中…</div>}>
              <ExcalidrawCanvas
                key={resolved.key}
                scene={resolved.scene}
                theme={dark ? 'dark' : 'light'}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { useDarkMode } from '../mermaid/useDarkMode.js';
import { $isWhiteboardNode, WhiteboardNode, type WhiteboardMode } from './WhiteboardNode.js';
import {
  diffScenes,
  parseScene,
  resolveDeltaScene,
  stringifyScene,
  type WhiteboardScene,
} from './scene.js';
import { useWhiteboardStorage } from './storage.js';
import { blockCard, blockLabel } from '../../ui/classes.css';
import * as css from './whiteboard.css';

// Excalidraw 体积大，仅在渲染白板时按需加载（编辑与只读两种形态共用）
const ExcalidrawCanvas = lazy(() =>
  import('./ExcalidrawCanvas.js').then((module) => ({ default: module.ExcalidrawCanvas })),
);

interface WhiteboardComponentProps {
  nodeKey: string;
  mode: WhiteboardMode;
  scene: string;
  src: string;
  patch: string;
  editable?: boolean;
}

/** 三种存储策略在 UI 上的文案 */
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
  /** 解析完成时的数据指纹，用于跳过「保存后回灌」引发的重复加载 */
  key: string;
  scene: WhiteboardScene;
  /** Delta 模式的基础快照；其余模式为 null */
  base: WhiteboardScene | null;
}

/**
 * 白板静态渲染器（DecoratorNode 的 decorate 产物）。
 * - 按节点的存储策略解析出完整场景后交给 Excalidraw 画布；
 * - 编辑模式下头部提供策略切换与保存（写回节点）；
 * - 只读模式用 viewModeEnabled 展示，交互被禁用。
 */
export function WhiteboardComponent({
  nodeKey,
  mode,
  scene,
  src,
  patch,
  editable: editableProp,
}: WhiteboardComponentProps) {
  const [editor] = useLexicalComposerContext();
  const storage = useWhiteboardStorage();
  const dark = useDarkMode();
  const [editorEditable, setEditable] = useState(() => editor.isEditable());
  const [resolved, setResolved] = useState<ResolvedState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  const sourceKey = sourceKeyOf(mode, src, scene, patch);
  /** 当前画布内容（onChange 即时写入，保存时以它为准） */
  const liveRef = useRef<WhiteboardScene | null>(null);
  /** 已持久化场景的指纹，用于脏检查 */
  const baselineRef = useRef<string | null>(null);
  /** 本组件自己写回的指纹，避免保存/切换策略后再从远端拉一次 */
  const ownKeyRef = useRef<string | null>(null);
  const dirtyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => editor.registerEditableListener(setEditable), [editor]);

  const editable = editableProp ?? editorEditable;

  useEffect(() => () => clearTimeout(dirtyTimer.current), []);

  /** 解析完成：记录基线并展示 */
  const accept = useCallback(
    (nextScene: WhiteboardScene, base: WhiteboardScene | null, key: string) => {
      baselineRef.current = stringifyScene(nextScene);
      liveRef.current = nextScene;
      setResolved({ key, scene: nextScene, base });
      setDirty(false);
    },
    [],
  );

  // 按存储策略解析场景：内联直接解析，远程拉快照，Delta 再叠加差值补丁
  useEffect(() => {
    if (sourceKey === ownKeyRef.current) return;
    let cancelled = false;
    const fail = (message: string) => {
      if (cancelled) return;
      setResolved(null);
      setError(message);
    };

    setError(null);
    liveRef.current = null;
    baselineRef.current = null;

    if (mode === 'inline') {
      accept(parseScene(scene), null, sourceKey);
      return;
    }
    if (!storage) {
      fail('未配置远端存储，无法加载白板快照');
      return;
    }
    if (!src) {
      fail('白板缺少快照引用，请先保存一次');
      return;
    }

    (async () => {
      try {
        const text = await storage.load(src);
        if (cancelled) return;
        if (mode === 'remote') {
          accept(parseScene(text), null, sourceKey);
        } else {
          const base = parseScene(text);
          accept(resolveDeltaScene(base, patch), base, sourceKey);
        }
      } catch (e) {
        fail(e instanceof Error ? e.message : '白板快照加载失败');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sourceKey, mode, scene, src, patch, storage, accept]);

  /** 画布变更：立即记入 liveRef，脏标记做轻量去抖，避免每次指针移动都重渲染 */
  const handleCanvasChange = useCallback((nextScene: WhiteboardScene) => {
    liveRef.current = nextScene;
    clearTimeout(dirtyTimer.current);
    dirtyTimer.current = setTimeout(() => {
      setDirty(baselineRef.current !== null && stringifyScene(nextScene) !== baselineRef.current);
    }, 200);
  }, []);

  /** 写回节点数据；调用后本组件会跳过对应的重新加载 */
  const writeNode = useCallback(
    (mutate: (node: WhiteboardNode) => void) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isWhiteboardNode(node)) mutate(node);
      });
    },
    [editor, nodeKey],
  );

  /** 切换存储策略：远程 / Delta 需要先把当前场景上传成基础快照，避免内容丢失 */
  const switchMode = async (next: WhiteboardMode) => {
    const current = liveRef.current ?? resolved?.scene;
    if (!current || next === mode || busy) return;

    if (next === 'inline') {
      const text = stringifyScene(current);
      const key = sourceKeyOf('inline', '', text, '');
      ownKeyRef.current = key;
      writeNode((node) => {
        node.setMode('inline');
        node.setScene(text);
        node.setSrc('');
        node.setPatch('');
      });
      baselineRef.current = text;
      setResolved({ key, scene: current, base: null });
      setDirty(false);
      setError(null);
      return;
    }

    if (!storage) {
      setError('未配置远端存储，无法切换到该策略');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const text = stringifyScene(current);
      const url = await storage.upload(text);
      const patchText = next === 'delta' ? '[]' : '';
      const key = sourceKeyOf(next, url, '', patchText);
      ownKeyRef.current = key;
      writeNode((node) => {
        node.setMode(next);
        node.setSrc(url);
        node.setScene('');
        node.setPatch(patchText);
      });
      baselineRef.current = text;
      setResolved({ key, scene: current, base: next === 'delta' ? current : null });
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : '快照上传失败');
    } finally {
      setBusy(false);
    }
  };

  /** 保存：按当前策略把画布内容持久化到节点 */
  const save = async () => {
    const current = liveRef.current ?? resolved?.scene;
    if (!current || resolved === null || busy) return;

    setBusy(true);
    setError(null);
    try {
      const text = stringifyScene(current);

      if (mode === 'inline') {
        const key = sourceKeyOf('inline', '', text, '');
        ownKeyRef.current = key;
        writeNode((node) => node.setScene(text));
        baselineRef.current = text;
        setResolved({ key, scene: current, base: null });
      } else if (mode === 'remote') {
        if (!storage) throw new Error('未配置远端存储，无法上传快照');
        const url = await storage.upload(text);
        const key = sourceKeyOf('remote', url, '', '');
        ownKeyRef.current = key;
        writeNode((node) => node.setSrc(url));
        baselineRef.current = text;
        setResolved({ key, scene: current, base: null });
      } else {
        if (!storage) throw new Error('未配置远端存储，无法上传快照');
        if (!resolved.base) {
          // 首次保存：当前场景本身就是基础快照，补丁为空
          const url = await storage.upload(text);
          const key = sourceKeyOf('delta', url, '', '[]');
          ownKeyRef.current = key;
          writeNode((node) => {
            node.setSrc(url);
            node.setPatch('[]');
          });
          baselineRef.current = text;
          setResolved({ key, scene: current, base: current });
        } else {
          const patchText = JSON.stringify(diffScenes(resolved.base, current));
          const key = sourceKeyOf('delta', src, '', patchText);
          ownKeyRef.current = key;
          writeNode((node) => node.setPatch(patchText));
          baselineRef.current = text;
          setResolved({ key, scene: current, base: resolved.base });
        }
      }
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : '白板保存失败');
    } finally {
      setBusy(false);
    }
  };

  const modeHint = MODE_META.find((item) => item.value === mode)?.hint ?? '';

  return (
    <div className={blockCard} data-node-key={nodeKey}>
      <div className={css.header}>
        <span className={blockLabel}>白板</span>
        {editable ? (
          <select
            className={css.modeSelect}
            value={mode}
            disabled={busy}
            title={modeHint}
            onChange={(e) => void switchMode(e.target.value as WhiteboardMode)}
          >
            {MODE_META.map((item) => (
              <option key={item.value} value={item.value} title={item.hint}>
                {item.label}
              </option>
            ))}
          </select>
        ) : (
          <span className={css.modeHint}>{modeHint}</span>
        )}
        {editable ? (
          <button
            type="button"
            className={css.saveBtn}
            title="保存白板内容"
            disabled={busy || !dirty}
            // 阻止 selection 变化，保存只是节点数据写回
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => void save()}
          >
            {busy ? '处理中…' : dirty ? '保存' : '已保存'}
          </button>
        ) : null}
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
              readOnly={!editable}
              theme={dark ? 'dark' : 'light'}
              onChange={handleCanvasChange}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}

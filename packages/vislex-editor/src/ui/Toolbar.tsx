import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createRangeSelection,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  mergeRegister,
} from 'lexical';
import type { EditorState, PointType, RangeSelection } from 'lexical';
import type { EditorPlugin, ToolbarButtonItem, ToolbarSelectItem } from '../types.js';
import * as css from './toolbar.css';

function isSameIdSet(prev: ReadonlySet<string>, next: ReadonlySet<string>): boolean {
  if (prev.size !== next.size) return false;
  for (const id of next) {
    if (!prev.has(id)) return false;
  }
  return true;
}

function isSameRecord(prev: Record<string, string>, next: Record<string, string>): boolean {
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return false;
  for (const key of nextKeys) {
    if (prev[key] !== next[key]) return false;
  }
  return true;
}

/** 选区锚点/焦点的可序列化快照，用于跨失焦恢复 */
interface SelectionPoint {
  key: string;
  offset: number;
  type: PointType['type'];
}

interface SavedSelection {
  anchor: SelectionPoint;
  focus: SelectionPoint;
}

/**
 * 工具栏：按钮与下拉选择全部由插件声明，这里只负责分组渲染与状态刷新。
 *
 * 关键约束：
 * 1. 激活态/当前值一律在编辑器更新监听里算好，渲染期绝不调用 editor 上的读写 API。
 *    渲染期读编辑器状态会触发 Lexical 的挂起更新，从而把 setState 卷进别的组件的渲染过程。
 * 2. 按钮用 onMouseDown preventDefault 保住选区；原生 <select> 不能 preventDefault
 *    （否则下拉框打不开），所以在 mousedown 时快照选区、onChange 时再恢复。
 */
export function Toolbar({ plugins }: { plugins: EditorPlugin[] }) {
  const [editor] = useLexicalComposerContext();

  const groups = useMemo(
    () => plugins.filter((plugin) => (plugin.toolbar?.length ?? 0) > 0),
    [plugins],
  );
  const items = useMemo(() => groups.flatMap((plugin) => plugin.toolbar ?? []), [groups]);

  const buttonItems = useMemo(
    () => items.filter((item): item is ToolbarButtonItem => item.type !== 'select'),
    [items],
  );
  const selectItems = useMemo(
    () => items.filter((item): item is ToolbarSelectItem => item.type === 'select'),
    [items],
  );

  const [activeIds, setActiveIds] = useState<ReadonlySet<string>>(() => new Set<string>());
  const [selectValues, setSelectValues] = useState<Record<string, string>>({});
  const [editable, setEditable] = useState(() => editor.isEditable());

  // 下拉框打开前保存的选区快照；原生 select 打开会让编辑器失焦，需在 onChange 时恢复
  const savedSelectionRef = useRef<SavedSelection | null>(null);

  useEffect(() => {
    const syncState = (editorState: EditorState) => {
      const nextActive = new Set<string>();
      const nextSelectValues: Record<string, string> = {};
      editorState.read(() => {
        for (const item of buttonItems) {
          if (item.isActive?.()) nextActive.add(item.id);
        }
        for (const item of selectItems) {
          nextSelectValues[item.id] = item.value();
        }
      });
      setActiveIds((prev) => (isSameIdSet(prev, nextActive) ? prev : nextActive));
      setSelectValues((prev) => (isSameRecord(prev, nextSelectValues) ? prev : nextSelectValues));
    };

    // 挂载时先同步一次，之后交给更新监听
    syncState(editor.getEditorState());

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => syncState(editorState)),
      editor.registerEditableListener((value) => setEditable(value)),
    );
  }, [editor, buttonItems, selectItems]);

  /** 在只读上下文中抓取当前选区快照（打开下拉框前调用） */
  const saveSelection = () => {
    editor.getEditorState().read(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) {
        savedSelectionRef.current = {
          anchor: { key: sel.anchor.key, offset: sel.anchor.offset, type: sel.anchor.type },
          focus: { key: sel.focus.key, offset: sel.focus.offset, type: sel.focus.type },
        };
      } else {
        savedSelectionRef.current = null;
      }
    });
  };

  /** 在 update 上下文中恢复快照选区并返回（供 onChange 内打样式用） */
  const restoreSelection = (): RangeSelection | null => {
    const saved = savedSelectionRef.current;
    if (!saved) {
      const sel = $getSelection();
      return $isRangeSelection(sel) ? sel : null;
    }
    const selection = $createRangeSelection();
    selection.anchor.set(saved.anchor.key, saved.anchor.offset, saved.anchor.type);
    selection.focus.set(saved.focus.key, saved.focus.offset, saved.focus.type);
    $setSelection(selection);
    return selection;
  };

  return (
    <div
      className={css.toolbar}
      role="toolbar"
      aria-label="格式工具栏"
    >
      {groups.map((plugin, groupIndex) => (
        <Fragment key={plugin.name}>
          {groupIndex > 0 ? (
            <span className={css.separator} aria-hidden="true" />
          ) : null}
          {(plugin.toolbar ?? []).map((item) => {
            if (item.type === 'select') {
              return (
                <select
                  key={item.id}
                  className={css.select}
                  title={item.title}
                  aria-label={item.title}
                  disabled={!editable}
                  value={selectValues[item.id] ?? item.options[0]?.value ?? ''}
                  // 不能 preventDefault：否则原生下拉框不会打开。
                  // 改为在 mousedown 时快照选区，onChange 时恢复。
                  onMouseDown={saveSelection}
                  onChange={(event) => {
                    const value = event.target.value;
                    editor.update(() => {
                      const selection = restoreSelection();
                      if (!selection) return;
                      item.onChange(editor, value);
                    });
                  }}
                >
                  {item.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              );
            }

            const active = activeIds.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                className={css.button}
                data-item={item.id}
                title={item.title}
                aria-label={item.title}
                aria-pressed={active}
                disabled={!editable}
                // 阻止默认行为，避免点击按钮时 contentEditable 失去选区
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => item.run(editor)}
              >
                {item.label}
              </button>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

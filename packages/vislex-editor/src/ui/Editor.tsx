import { useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { createEditorConfig } from '../composer/createEditorConfig.js';
import { PluginHost } from '../plugin/PluginHost.js';
import { blogEditorPreset } from '../presets/blog.js';
import { WhiteboardStorageProvider, type WhiteboardStorage } from '../plugins/whiteboard/storage.js';
import { GalleryStorageProvider, type GalleryStorage } from '../plugins/gallery/storage.js';
import { VideoStorageProvider, type VideoStorage } from '../plugins/video/storage.js';
import type { EditorPlugin, EditorPreset } from '../types.js';
import { Toolbar } from './Toolbar.js';
import * as css from './editor.css';

/** 空 EditorState JSON 常量（作为初始值和空态判断依据） */
export const EMPTY_EDITOR_STATE = {
  root: { children: [], type: 'root', version: 1 },
};

export interface EditorProps {
  /** 受控值：Lexical EditorState JSON 对象（来自 editorState.toJSON()，或者 Prisma Json 字段的 parse 结果） */
  value?: unknown;
  /** 非受控初始值，仅在挂载时读取一次 */
  defaultValue?: unknown;
  /** 内容变化回调，参数为最新 EditorState JSON 对象 */
  onChange?: (json: unknown) => void;
  /** 场景预设，默认博客正文 */
  preset?: EditorPreset;
  /** 追加插件（与预设插件合并） */
  plugins?: EditorPlugin[];
  /** 占位文案，缺省用预设里的 */
  placeholder?: string;
  readOnly?: boolean;
  /** 是否渲染工具栏 */
  showToolbar?: boolean;
  /** 追加到根容器的类名 */
  className?: string;
  /**
   * 白板快照的远端存储适配器。
   * 不传时白板仍可用内联策略，远程 / Delta 会被禁用（vislex 不绑定具体后端接口）。
   */
  whiteboardStorage?: WhiteboardStorage | null;
  /**
   * 图库图片的远端存储适配器。
   * 不传时仍可手动填写图片链接，仅本地上传入口被禁用（vislex 不绑定具体后端接口）。
   */
  galleryStorage?: GalleryStorage | null;
  /**
   * 视频的远端存储适配器。
   * 不传时仍可手动填写视频地址，仅本地上传入口被禁用（vislex 不绑定具体后端接口）。
   */
  videoStorage?: VideoStorage | null;
}

/**
 * 受控值同步：
 * - 外部 value 变化时用 setEditorState(parseEditorState(json)) 回灌；
 * - 编辑器变化时导出 editorState.toJSON() 回调，回声比对避免回路。
 */
function JsonValueSync({
  value,
  onChangeRef,
}: {
  value?: unknown;
  onChangeRef: MutableRefObject<((json: unknown) => void) | undefined>;
}) {
  const [editor] = useLexicalComposerContext();
  const lastEmittedRef = useRef<string | null>(null);

  // 受控值回灌：外部给的 value 与编辑器当前状态不一致才回灌。
  // 空 root 跳过（Lexical 不允许 set 空 root）；基准存「解析后规范化」的序列化结果，
  // 这样随后编辑器自身回调的是同一串，不会把这次回灌误判成一次用户变更。
  useEffect(() => {
    if (value === undefined || value === null) return;
    const children = (value as { root?: { children?: unknown[] } })?.root?.children;
    if (!Array.isArray(children) || children.length === 0) return;

    const key = JSON.stringify(value);
    if (key === lastEmittedRef.current) return;
    try {
      const nextState = editor.parseEditorState(key);
      lastEmittedRef.current = JSON.stringify(nextState.toJSON());
      editor.setEditorState(nextState);
    } catch (e) {
      console.error('[vislex] invalid editor state JSON', e);
    }
  }, [editor, value]);

  // 编辑器变更上报：基准取编辑器自身的初始状态（含 direction/format 等字段），
  // 否则初始空态会与入参 EMPTY 常量文本不一致，被误判成一次变更回调出去，
  // 从而把外部刚加载的内容覆盖成空。
  useEffect(() => {
    lastEmittedRef.current = JSON.stringify(editor.getEditorState().toJSON());
    return editor.registerUpdateListener(({ editorState }) => {
      const json = editorState.toJSON();
      const key = JSON.stringify(json);
      if (key === lastEmittedRef.current) return;
      lastEmittedRef.current = key;
      onChangeRef.current?.(json);
    });
  }, [editor, onChangeRef]);

  return null;
}

/** 运行期切换只读状态 */
function EditableSync({ readOnly }: { readOnly: boolean }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  return null;
}

function normalizeInitialJson(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || !('root' in (raw as Record<string, unknown>))) return EMPTY_EDITOR_STATE;
  return raw as Record<string, unknown>;
}

export function Editor({
  value,
  defaultValue,
  onChange,
  preset = blogEditorPreset,
  plugins,
  placeholder,
  readOnly = false,
  showToolbar = true,
  className,
  whiteboardStorage,
  galleryStorage,
  videoStorage,
}: EditorProps) {
  const mergedPlugins = useMemo(
    () => (plugins && plugins.length > 0 ? [...preset.plugins, ...plugins] : preset.plugins),
    [preset, plugins],
  );

  const pluginNames = mergedPlugins.map((plugin) => plugin.name).join('|');
  const stablePlugins = useMemo(() => mergedPlugins, [pluginNames]);

  // 预设转换器 + 各插件追加的转换器（代码块等），同时驱动快捷键与 Markdown 往返
  const transformers = useMemo(
    () => [...preset.transformers, ...stablePlugins.flatMap((plugin) => plugin.transformers ?? [])],
    [preset, stablePlugins],
  );

  // 初始内容只取首帧
  const initialJsonRef = useRef<Record<string, unknown> | null>(null);
  if (initialJsonRef.current === null) {
    initialJsonRef.current = normalizeInitialJson(value ?? defaultValue ?? null);
  }
  const initialJson = initialJsonRef.current;

  const configRef = useRef<InitialConfigType | null>(null);
  if (configRef.current === null) {
    configRef.current = createEditorConfig({
      preset,
      plugins: stablePlugins,
      initialJson,
      readOnly,
    });
  }

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const placeholderText = placeholder ?? preset.placeholder ?? '';

  return (
    <div
      className={`vislex-root ${css.root}${className ? ` ${className}` : ''}`}
    >
      <WhiteboardStorageProvider storage={whiteboardStorage}>
        <GalleryStorageProvider storage={galleryStorage}>
          <VideoStorageProvider storage={videoStorage}>
            <LexicalComposer initialConfig={configRef.current}>
              <PluginHost plugins={stablePlugins} />
              {showToolbar ? <Toolbar plugins={stablePlugins} /> : null}
              <div className={`vislex-body ${css.body}`}>
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable className={css.contentEditable} />
                  }
                  placeholder={
                    <div className={css.placeholder}>
                      {placeholderText}
                    </div>
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </div>
              <MarkdownShortcutPlugin transformers={transformers} />
              <JsonValueSync
                value={value ?? null}
                onChangeRef={onChangeRef}
              />
              <EditableSync readOnly={readOnly} />
            </LexicalComposer>
          </VideoStorageProvider>
        </GalleryStorageProvider>
      </WhiteboardStorageProvider>
    </div>
  );
}

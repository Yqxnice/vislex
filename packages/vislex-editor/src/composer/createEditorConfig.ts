import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import type { EditorThemeClasses, Klass, LexicalNode } from 'lexical';
import type { EditorPlugin, EditorPreset } from '../types.js';
import { baseTheme } from './theme.js';

export interface EditorConfigInput {
  preset: EditorPreset;
  /** 预设插件 + 调用方追加插件的合并结果 */
  plugins: EditorPlugin[];
  /** 初始 EditorState JSON 对象（来自 editorState.toJSON()） */
  initialJson: Record<string, unknown>;
  readOnly?: boolean;
}

/** 合并主题：基础主题 → 预设主题 → 插件主题，后者覆盖前者 */
function mergeTheme(preset: EditorPreset, plugins: EditorPlugin[]): EditorThemeClasses {
  const merged: EditorThemeClasses = { ...baseTheme, ...preset.theme };
  for (const plugin of plugins) {
    Object.assign(merged, plugin.theme);
  }
  return merged;
}

/**
 * 收集节点全集并去重。
 * Lexical 的节点注册只能发生在创建 composer 时，运行期无法追加，
 * 所以预设与所有插件的 nodes 必须在这里一次性合并。
 */
export function collectNodes(
  preset: EditorPreset,
  plugins: EditorPlugin[],
): Array<Klass<LexicalNode>> {
  const seen = new Set<string>();
  const nodes: Array<Klass<LexicalNode>> = [];
  const candidates = [...preset.nodes, ...plugins.flatMap((plugin) => plugin.nodes ?? [])];
  for (const node of candidates) {
    const type = node.getType();
    if (seen.has(type)) continue;
    seen.add(type);
    nodes.push(node);
  }
  return nodes;
}

/** 由「预设 + 插件」编译出 LexicalComposer 的 initialConfig */
export function createEditorConfig(input: EditorConfigInput): InitialConfigType {
  const { preset, plugins, initialJson, readOnly = false } = input;
  // 初始 JSON 为空 root 时不播种，让编辑器保持默认空态即可
  const hasContent =
    typeof initialJson === 'object' &&
    initialJson !== null &&
    typeof (initialJson as Record<string, unknown>).root === 'object' &&
    Array.isArray(((initialJson as Record<string, unknown>).root as Record<string, unknown>).children) &&
    (((initialJson as Record<string, unknown>).root as Record<string, unknown>).children as unknown[]).length > 0;

  return {
    namespace: `vislex-${preset.name}`,
    nodes: collectNodes(preset, plugins),
    theme: mergeTheme(preset, plugins),
    editable: !readOnly,
    onError: (error: Error) => {
      console.error('[vislex]', error);
    },
    // 播种初始 EditorState：直接 parse + set
    editorState: (editor) => {
      if (!hasContent) return;
      try {
        editor.setEditorState(editor.parseEditorState(JSON.stringify(initialJson)));
      } catch (e) {
        console.error('[vislex] failed to parse initial editor state', e);
      }
    },
  };
}

import type { ReactNode } from 'react';
import type { EditorThemeClasses, Klass, LexicalEditor, LexicalNode } from 'lexical';
import type { Transformer } from '@lexical/markdown';

/**
 * 工具栏通用字段。
 * 插件只描述「长什么样、点了做什么」，渲染与激活态订阅由 Toolbar 统一负责。
 */
interface ToolbarItemBase {
  /** 唯一标识，同一编辑器内不可重复 */
  id: string;
  /** 悬浮提示 */
  title: string;
}

/** 按钮型工具栏项：点击触发一个动作 */
export interface ToolbarButtonItem extends ToolbarItemBase {
  type?: 'button';
  /** 按钮显示内容（字符或图标） */
  label: ReactNode;
  /**
   * 是否处于激活态。
   * 调用时已经处于 editor 的只读上下文中，可以直接使用 $getSelection() 等 $ 前缀 API。
   */
  isActive?: () => boolean;
  /** 点击执行；不在 update 上下文中，需要写操作时自行 editor.update */
  run: (editor: LexicalEditor) => void;
}

/** 下拉选择型工具栏项：从一组选项中选一个值（如字体、字号） */
export interface ToolbarSelectItem extends ToolbarItemBase {
  type: 'select';
  /** 可选项 */
  options: Array<{ value: string; label: string }>;
  /**
   * 当前选中值，在 editor 的只读上下文中调用。
   * 返回值应能匹配 options 中某一项的 value；匹配不上时回退到第一项。
   */
  value: () => string;
  /**
   * 选择变更时执行。Toolbar 会在 editor.update 上下文中调用，并已恢复打开下拉框前的选区，
   * 因此可直接使用 $getSelection() / $patchStyleText 等写操作 API，无需自行 editor.update。
   */
  onChange: (editor: LexicalEditor, value: string) => void;
}

/** 工具栏项：按钮或下拉选择 */
export type ToolbarItem = ToolbarButtonItem | ToolbarSelectItem;

/**
 * 应用层插件契约。插件只做声明、不改核心。
 * register 必须返回卸载函数，否则会造成监听器泄漏。
 */
export interface EditorPlugin {
  /** 插件名，决定渲染 key 与工具栏分组，需唯一 */
  name: string;
  /**
   * 插件依赖的 Lexical 节点。
   * Lexical 只允许在创建 composer 时注册节点、运行期无法追加，
   * 所以这些节点由 composer 工厂在创建编辑器前统一收集。
   */
  nodes?: Array<Klass<LexicalNode>>;
  /** 插件贡献的主题类名，与预设主题合并 */
  theme?: EditorThemeClasses;
  /** 插件贡献的工具栏按钮 */
  toolbar?: ToolbarItem[];
  /**
   * 插件贡献的 Markdown 转换器。
   * 追加在预设 transformers 之后，同时作用于输入快捷键与 Markdown 往返。
   */
  transformers?: Transformer[];
  /** 挂载插件（注册命令与监听器），返回卸载函数 */
  register?: (editor: LexicalEditor) => () => void;
  /** 插件贡献的 React 子树，在 composer 内部渲染 */
  render?: () => ReactNode;
}

/** 预设：一个使用场景（如博客正文）的全量装配清单 */
export interface EditorPreset {
  name: string;
  /** 预设声明的节点全集 */
  nodes: Array<Klass<LexicalNode>>;
  /** 默认启用的插件 */
  plugins: EditorPlugin[];
  /** Markdown 轻量标记转换器，决定输入快捷键与往返语义 */
  transformers: Transformer[];
  /** 预设附加主题（叠加在基础主题之上） */
  theme?: EditorThemeClasses;
  /** 默认占位文案 */
  placeholder?: string;
}

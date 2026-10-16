import { createCommand } from 'lexical';

/**
 * 通知某个公式节点打开编辑模态框（工具栏/斜杠菜单插入后派发；组件本身监听）。
 * 独立叶子模块：供 MathComponent 引用而不经过插件 barrel，避免
 * config-edit → 节点文件 → 组件 → 插件 index → transformer → 节点 的循环求值。
 */
export const OPEN_MATH_MODAL_COMMAND = createCommand<{ nodeKey: string }>('OPEN_MATH_MODAL');

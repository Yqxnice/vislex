import type { EditorPlugin } from '../../types';
import { SlashMenuPlugin } from './SlashMenuPlugin';

/**
 * 斜杠菜单（键入 "/" 触发的块插入聚合菜单）。
 * 纯编辑器 UI：无节点、无 Markdown 转换器、无 core 副本。
 */
export const slashMenuPlugin: EditorPlugin = {
  name: 'slashMenu',
  render: () => <SlashMenuPlugin />,
};

export { SlashMenuPlugin } from './SlashMenuPlugin';

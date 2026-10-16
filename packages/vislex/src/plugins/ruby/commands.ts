import { createCommand } from 'lexical';

/** 通知某个 ruby 节点打开编辑模态框（工具栏插入空节点后派发；组件本身监听） */
export const OPEN_RUBY_MODAL_COMMAND = createCommand<{ nodeKey: string }>('OPEN_RUBY_MODAL');

import { Fragment, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { EditorPlugin } from '../types';

/**
 * 插件宿主：把插件的「挂载 / 渲染」两部分分别接到编辑器上。
 * 挂载副作用只在插件集合稳定时执行一次，卸载时统一清理，避免监听器泄漏。
 */
export function PluginHost({ plugins }: { plugins: EditorPlugin[] }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregisterList = plugins
      .map((plugin) => plugin.register?.(editor))
      .filter((unregister): unregister is () => void => typeof unregister === 'function');

    return () => {
      for (const unregister of unregisterList) unregister();
    };
  }, [editor, plugins]);

  return (
    <>
      {plugins.map((plugin) =>
        plugin.render ? <Fragment key={plugin.name}>{plugin.render()}</Fragment> : null,
      )}
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin';
import { GripVertical } from 'lucide-react';
import { PortalThemeWrapper } from '@vislex/style-token';
import type { EditorPlugin } from '../../types.js';
import * as css from './draggableBlock.css';

/**
 * 拖拽块手柄（块级排序）。
 * 基于 @lexical/react 的实验版 DraggableBlockPlugin：只作用于 root 直接子级，
 * 拖动 ⠿ 手柄移动整块，落点指示线由插件自动定位。
 * 纯编辑器 UI：无节点、无 Markdown 转换器、无 core 副本。
 */
function DraggableBlockHandle() {
  const [editor] = useLexicalComposerContext();
  const [anchorElem, setAnchorElem] = useState<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const targetLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 定位锚点：编辑器滚动容器（.vislex-body，position: relative），回退 body
    const root = editor.getRootElement();
    setAnchorElem(root?.parentElement ?? document.body);
  }, [editor]);

  if (!anchorElem) return null;

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={anchorElem}
      menuRef={menuRef}
      targetLineRef={targetLineRef}
      menuComponent={
        <PortalThemeWrapper>
          <div ref={menuRef} className={css.handle} title="拖拽移动整块">
            <GripVertical size={14} />
          </div>
        </PortalThemeWrapper>
      }
      targetLineComponent={
        <PortalThemeWrapper>
          <div ref={targetLineRef} className={css.targetLine} />
        </PortalThemeWrapper>
      }
      isOnMenu={(element) => menuRef.current?.contains(element) ?? false}
    />
  );
}

export const draggableBlockPlugin: EditorPlugin = {
  name: 'draggableBlock',
  render: () => <DraggableBlockHandle />,
};

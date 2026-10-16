import { lazy, Suspense, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { Frame } from 'lucide-react';
import { $isEmbedNode } from './EmbedNode.js';
import { blockCard, blockHeader, blockLabel } from '../../ui/classes.css';
import * as css from './embed.css';

// 编辑模态框按需加载，避免首屏体积膨胀
const EmbedModal = lazy(() => import('./EmbedModal.js').then((m) => ({ default: m.EmbedModal })));

interface EmbedComponentProps {
  nodeKey: string;
  src: string;
  title?: string;
  editable?: boolean;
}

/**
 * 嵌入块渲染器（DecoratorNode 的 decorate 产物）。
 * - 沙箱化 iframe：禁止表单提交 / 顶级导航，保留脚本 / 同源 / 弹层（B 站、YouTube 播放器需要）；
 * - 编辑模式右上角「编辑」按钮；新插入的空嵌入自动打开编辑模态框。
 */
export function EmbedComponent({ nodeKey, src, title, editable: editableProp }: EmbedComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [editorEditable, setEditable] = useState(() => editor.isEditable());
  const [modalOpen, setModalOpen] = useState(() => editor.isEditable() && !src);

  useEffect(() => editor.registerEditableListener(setEditable), [editor]);

  const editable = editableProp ?? editorEditable;

  const handleSave = (nextSrc: string, nextTitle?: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isEmbedNode(node)) {
        node.setSrc(nextSrc);
        node.setTitle(nextTitle);
      }
    });
    setModalOpen(false);
  };

  return (
    <div className={blockCard} data-node-key={nodeKey}>
      <div className={blockHeader}>
        <span className={blockLabel}>
          <Frame size={13} />
          嵌入{title ? ` · ${title}` : ''}
        </span>
        {editable ? (
          <button
            type="button"
            className={css.editBtn}
            title="编辑嵌入"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setModalOpen(true)}
          >
            编辑
          </button>
        ) : null}
      </div>
      <div className={css.ratioBox}>
        {src ? (
          <iframe
            src={src}
            title={title || '嵌入内容'}
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            allow="fullscreen; picture-in-picture"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className={css.emptyOverlay}>
            <Frame size={22} />
            <span>还没有嵌入地址，点击「编辑」添加</span>
          </div>
        )}
      </div>

      {modalOpen ? (
        <Suspense fallback={null}>
          <EmbedModal
            initialSrc={src}
            initialTitle={title}
            onCancel={() => setModalOpen(false)}
            onSave={handleSave}
          />
        </Suspense>
      ) : null}
    </div>
  );
}

import { lazy, Suspense, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { Film } from 'lucide-react';
import { $isVideoNode } from './VideoNode.js';
import { blockCard, blockHeader, blockLabel } from '../../ui/classes.css';
import * as css from './video.css';

// 编辑模态框按需加载，避免首屏体积膨胀
const VideoModal = lazy(() => import('./VideoModal.js').then((m) => ({ default: m.VideoModal })));

interface VideoComponentProps {
  nodeKey: string;
  src: string;
  poster?: string;
  title?: string;
  editable?: boolean;
}

/**
 * 视频块渲染器（DecoratorNode 的 decorate 产物）。
 * - 渲染 <video controls>；编辑模式右上角「编辑」按钮打开模态框；
 * - 新插入的空视频自动打开编辑模态框。
 */
export function VideoComponent({ nodeKey, src, poster, title, editable: editableProp }: VideoComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [editorEditable, setEditable] = useState(() => editor.isEditable());
  const [modalOpen, setModalOpen] = useState(() => editor.isEditable() && !src);

  useEffect(() => editor.registerEditableListener(setEditable), [editor]);

  const editable = editableProp ?? editorEditable;

  const handleSave = (nextSrc: string, nextPoster?: string, nextTitle?: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isVideoNode(node)) {
        node.setSrc(nextSrc);
        node.setPoster(nextPoster);
        node.setTitle(nextTitle);
      }
    });
    setModalOpen(false);
  };

  return (
    <div className={blockCard} data-node-key={nodeKey}>
      <div className={blockHeader}>
        <span className={blockLabel}>
          <Film size={13} />
          视频{title ? ` · ${title}` : ''}
        </span>
        {editable ? (
          <button
            type="button"
            className={css.editBtn}
            title="编辑视频"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setModalOpen(true)}
          >
            编辑
          </button>
        ) : null}
      </div>
      <div className={css.stage}>
        {src ? (
          <video src={src} poster={poster} title={title} controls preload="metadata" />
        ) : (
          <div className={css.emptyBox}>
            <Film size={22} />
            <span>还没有视频，点击「编辑」添加</span>
          </div>
        )}
      </div>

      {modalOpen ? (
        <Suspense fallback={null}>
          <VideoModal
            initialSrc={src}
            initialPoster={poster}
            initialTitle={title}
            onCancel={() => setModalOpen(false)}
            onSave={handleSave}
          />
        </Suspense>
      ) : null}
    </div>
  );
}

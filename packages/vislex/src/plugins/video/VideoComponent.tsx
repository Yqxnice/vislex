import { lazy, Suspense, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { Film } from 'lucide-react';
import { $isVideoNode } from './VideoNode';
import { blockCard, blockHeader, blockLabel } from '../../ui/classes';

// 编辑模态框按需加载，避免首屏体积膨胀
const VideoModal = lazy(() => import('./VideoModal').then((m) => ({ default: m.VideoModal })));

interface VideoComponentProps {
  nodeKey: string;
  src: string;
  poster?: string;
  title?: string;
}

/**
 * 视频块渲染器（DecoratorNode 的 decorate 产物）。
 * - 渲染 <video controls>；编辑模式右上角「编辑」按钮打开模态框；
 * - 新插入的空视频自动打开编辑模态框。
 */
export function VideoComponent({ nodeKey, src, poster, title }: VideoComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [editable, setEditable] = useState(() => editor.isEditable());
  const [modalOpen, setModalOpen] = useState(() => editor.isEditable() && !src);

  useEffect(() => editor.registerEditableListener(setEditable), [editor]);

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
            className="flex-none cursor-pointer rounded-md border border-vl-border-strong bg-vl-surface px-2 py-0.5 text-xs text-vl-text-muted hover:border-vl-brand hover:text-vl-brand"
            title="编辑视频"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setModalOpen(true)}
          >
            编辑
          </button>
        ) : null}
      </div>
      <div className="flex items-center justify-center [&_video]:block [&_video]:max-h-[420px] [&_video]:w-full [&_video]:bg-black">
        {src ? (
          <video src={src} poster={poster} title={title} controls preload="metadata" />
        ) : (
          <div className="w-full cursor-pointer rounded-lg border border-dashed border-vl-border bg-vl-surface-muted px-3 py-7 text-center text-[13px] text-vl-text-muted">
            <Film size={22} />
            <span>还没有视频，点击「编辑」添加</span>
          </div>
        )}
      </div>

      {modalOpen
        ? createPortal(
            <Suspense fallback={null}>
              <VideoModal
                initialSrc={src}
                initialPoster={poster}
                initialTitle={title}
                onCancel={() => setModalOpen(false)}
                onSave={handleSave}
              />
            </Suspense>,
            document.body,
          )
        : null}
    </div>
  );
}

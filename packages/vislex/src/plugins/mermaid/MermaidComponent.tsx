import { lazy, Suspense, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { $isMermaidNode } from './MermaidNode';
import { useDarkMode } from './useDarkMode';
import { useMermaidSvg } from './useMermaidSvg';
import { blockCard, blockEditBtn, blockHeader, blockLabel } from '../../ui/classes';

/** 双引擎产出的 SVG 统一限宽，避免撑破编辑区 */
const mermaidCanvas = '[&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-full';
const mermaidMuted = 'text-[13px] italic text-vl-text-muted';
const mermaidErrorMsg = 'text-[13px] text-red-600 dark:text-red-400';

// 模态框按需加载，避免首屏体积膨胀
const MermaidModal = lazy(() => import('./MermaidModal').then((m) => ({ default: m.MermaidModal })));

interface MermaidComponentProps {
  nodeKey: string;
  code: string;
}

/**
 * Mermaid 图表静态渲染器（DecoratorNode 的 decorate 产物）。
 * - 编辑模式下右上角叠加「编辑」按钮，打开源码编辑模态框；
 * - 同步引擎直接出图，不支持的类型由异步引擎兜底，失败则回显源码与错误。
 */
export function MermaidComponent({ nodeKey, code }: MermaidComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [editable, setEditable] = useState(() => editor.isEditable());
  const [modalOpen, setModalOpen] = useState(false);
  const dark = useDarkMode();
  const { svg, error, pending } = useMermaidSvg(code, dark);

  useEffect(() => editor.registerEditableListener(setEditable), [editor]);

  const handleSave = (nextCode: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isMermaidNode(node)) node.setCode(nextCode);
    });
  };

  const renderBody = () => {
    if (!code.trim()) {
      return <div className={mermaidMuted}>空图表，点击「编辑」输入 Mermaid 源码</div>;
    }
    if (svg) {
      return (
        <div
          className={mermaidCanvas}
          // SVG 由受信任的渲染引擎产出（官方引擎使用 securityLevel: strict）
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      );
    }
    if (pending) {
      return <div className={mermaidMuted}>渲染中…</div>;
    }
    return (
      <div>
        <div className={mermaidErrorMsg}>{error ?? '渲染失败'}</div>
        <pre className="mt-2 overflow-x-auto rounded-md bg-vl-code-bg px-3 py-2.5 font-mono text-xs leading-[1.6] whitespace-pre text-vl-text">
          {code}
        </pre>
      </div>
    );
  };

  return (
    <div className={blockCard} data-node-key={nodeKey}>
      <div className={blockHeader}>
        <span className={blockLabel}>Mermaid</span>
        {editable ? (
          <button
            type="button"
            className={blockEditBtn}
            title="编辑图表源码"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setModalOpen(true)}
          >
            编辑
          </button>
        ) : null}
      </div>
      <div className="overflow-x-auto p-3">{renderBody()}</div>
      {modalOpen
        ? createPortal(
            <Suspense fallback={null}>
              <MermaidModal
                initialCode={code}
                onCancel={() => setModalOpen(false)}
                onSave={(nextCode) => {
                  handleSave(nextCode);
                  setModalOpen(false);
                }}
              />
            </Suspense>,
            document.body,
          )
        : null}
    </div>
  );
}

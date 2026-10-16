import { lazy, Suspense, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { $isMermaidNode } from './MermaidNode.js';
import { useDarkMode } from './useDarkMode.js';
import { useMermaidSvg } from './useMermaidSvg.js';
import { blockCard, blockEditBtn, blockHeader, blockLabel } from '../../ui/classes.css';
import * as css from './mermaid.css';

// 模态框按需加载，避免首屏体积膨胀
const MermaidModal = lazy(() => import('./MermaidModal.js').then((m) => ({ default: m.MermaidModal })));

interface MermaidComponentProps {
  nodeKey: string;
  code: string;
  editable?: boolean;
}

/**
 * Mermaid 图表静态渲染器（DecoratorNode 的 decorate 产物）。
 * - 编辑模式下右上角叠加「编辑」按钮，打开源码编辑模态框；
 * - 同步引擎直接出图，不支持的类型由异步引擎兜底，失败则回显源码与错误。
 */
export function MermaidComponent({ nodeKey, code, editable: editableProp }: MermaidComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [editorEditable, setEditable] = useState(() => editor.isEditable());
  const [modalOpen, setModalOpen] = useState(false);
  const dark = useDarkMode();
  const { svg, error, pending } = useMermaidSvg(code, dark);

  useEffect(() => editor.registerEditableListener(setEditable), [editor]);

  const editable = editableProp ?? editorEditable;

  const handleSave = (nextCode: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isMermaidNode(node)) node.setCode(nextCode);
    });
  };

  const renderBody = () => {
    if (!code.trim()) {
      return <div className={css.muted}>空图表，点击「编辑」输入 Mermaid 源码</div>;
    }
    if (svg) {
      return (
        <div
          className={css.canvas}
          // SVG 由受信任的渲染引擎产出（官方引擎使用 securityLevel: strict）
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      );
    }
    if (pending) {
      return <div className={css.muted}>渲染中…</div>;
    }
    return (
      <div>
        <div className={css.errorMsg}>{error ?? '渲染失败'}</div>
        <pre className={css.errorPre}>{code}</pre>
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
      <div className={css.body}>{renderBody()}</div>
      {modalOpen ? (
        <Suspense fallback={null}>
          <MermaidModal
            initialCode={code}
            onCancel={() => setModalOpen(false)}
            onSave={(nextCode) => {
              handleSave(nextCode);
              setModalOpen(false);
            }}
          />
        </Suspense>
      ) : null}
    </div>
  );
}

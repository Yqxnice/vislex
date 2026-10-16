import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { $isBlockMathNode, $isInlineMathNode } from './nodes.js';
import { renderMath } from './katex.js';
import { OPEN_MATH_MODAL_COMMAND } from './commands.js';
import { blockEditBtn } from '../../ui/classes.css';
import { block, blockContent, inline } from './math.css';

// 模态窗口按需加载，避免首屏体积膨胀
const MathModal = lazy(() => import('./MathModal.js').then((m) => ({ default: m.MathModal })));

interface MathComponentProps {
  nodeKey: string;
  equation: string;
  displayMode: boolean;
  editable: boolean;
}

/**
 * 公式静态渲染器（DecoratorNode 的 decorate 产物）。
 * - 用 KaTeX 输出 HTML；
 * - 行内公式：点击任意位置打开编辑模态框；
 * - 块级公式：右上角「编辑」按钮打开模态框。
 */
export function MathComponent({ nodeKey, equation, displayMode, editable }: MathComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [modalOpen, setModalOpen] = useState(false);
  const html = useMemo(() => renderMath(equation, displayMode), [equation, displayMode]);

  // 工具栏插入空公式后派发命令，本组件打开自身编辑框
  useEffect(() => {
    return editor.registerCommand(
      OPEN_MATH_MODAL_COMMAND,
      (payload) => {
        if (payload.nodeKey === nodeKey) {
          setModalOpen(true);
          return true;
        }
        return false;
      },
      0,
    );
  }, [editor, nodeKey]);

  const handleSave = (nextEquation: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isInlineMathNode(node) || $isBlockMathNode(node)) {
        node.setEquation(nextEquation);
      }
    });
  };

  const modal = modalOpen ? (
    <Suspense fallback={null}>
      <MathModal
        initialEquation={equation}
        displayMode={displayMode}
        onCancel={() => setModalOpen(false)}
        onSave={(eq) => {
          handleSave(eq);
          setModalOpen(false);
        }}
      />
    </Suspense>
  ) : null;

  if (displayMode) {
    return (
      <div className={block} data-node-key={nodeKey}>
        <div
          className={blockContent}
          // KaTeX 输出为受信任的同源渲染结果
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {editable ? (
          <button
            type="button"
            className={blockEditBtn}
            title="编辑公式"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setModalOpen(true)}
          >
            编辑
          </button>
        ) : null}
        {modal}
      </div>
    );
  }

  return (
    <>
      <span
        className={inline}
        data-node-key={nodeKey}
        role={editable ? 'button' : undefined}
        tabIndex={editable ? 0 : undefined}
        title={editable ? '点击编辑公式' : undefined}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editable && setModalOpen(true)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {modal}
    </>
  );
}

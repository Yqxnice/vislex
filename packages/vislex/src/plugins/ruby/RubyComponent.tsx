import { lazy, Suspense, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_HIGH, $getNodeByKey } from 'lexical';
import { OPEN_RUBY_MODAL_COMMAND } from './commands';
import { $isRubyNode } from './RubyNode';

// 编辑模态框按需加载，避免首屏体积膨胀
const RubyModal = lazy(() => import('./RubyModal').then((m) => ({ default: m.RubyModal })));

interface RubyComponentProps {
  nodeKey: string;
  base: string;
  rt: string;
  editable: boolean;
}

/**
 * Ruby 注音渲染器（DecoratorNode 的 decorate 产物）。
 * - 输出 <ruby>base<rt>rt</rt></ruby>；编辑模式点击节点打开编辑模态框；
 * - 新插入的空注音由插件派发命令自动打开模态框。
 */
export function RubyComponent({ nodeKey, base, rt, editable }: RubyComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    return editor.registerCommand(
      OPEN_RUBY_MODAL_COMMAND,
      ({ nodeKey: targetKey }) => {
        if (targetKey === nodeKey) {
          setModalOpen(true);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, nodeKey]);

  const handleSave = (nextBase: string, nextRt: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isRubyNode(node)) {
        node.setBase(nextBase);
        node.setRt(nextRt);
      }
    });
    setModalOpen(false);
  };

  return (
    <span
      className="cursor-pointer [&_rt]:text-[0.7em] [&_rt]:select-none [&_rt]:text-vl-text-muted"
      data-node-key={nodeKey}
      onMouseDown={(event) => {
        if (!editable) return;
        event.preventDefault();
        setModalOpen(true);
      }}
    >
      <ruby>
        {base}
        <rt>{rt}</rt>
      </ruby>

      {modalOpen
        ? createPortal(
            <Suspense fallback={null}>
              <RubyModal
                initialBase={base}
                initialRt={rt}
                onCancel={() => setModalOpen(false)}
                onSave={handleSave}
              />
            </Suspense>,
            document.body,
          )
        : null}
    </span>
  );
}

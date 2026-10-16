import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import type { CodeFile } from './CodeBlockNode';
import { $isCodeBlockNode } from './CodeBlockNode';
import { highlightCode } from './highlight';
import { resolveLanguage } from './languages';
import { blockEditBtn, blockHeader } from '../../ui/classes';

// CodeMirror 体积大，仅在打开模态窗口时按需加载
const CodeMirrorModal = lazy(() =>
  import('./CodeMirrorModal').then((module) => ({ default: module.CodeMirrorModal })),
);

interface CodeBlockComponentProps {
  nodeKey: string;
  files: CodeFile[];
}

/** 单个文件的静态高亮视图：异步 shiki，未就绪或失败时回退纯文本 */
function CodePane({ file }: { file: CodeFile }) {
  const lang = useMemo(() => resolveLanguage(file), [file.name, file.language, file.code]);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHtml(null);
    highlightCode(file.code, lang).then((result) => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [file.code, lang]);

  if (html !== null) {
    // shiki 输出仅含 <pre><code><span style="--shiki-light/--shiki-dark">，无可注入内容
    return <div className="vislex-codeblock-html" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return (
    <pre className="m-0 overflow-x-auto px-3.5 py-3 font-mono text-[13px] leading-[1.6] whitespace-pre text-vl-text">
      <code>{file.code}</code>
    </pre>
  );
}

/**
 * 代码块静态渲染器（DecoratorNode 的 decorate 产物）。
 * - 任何模式下都渲染 shiki 双主题高亮，多文件时提供标签页切换；
 * - 编辑模式下右上角叠加「编辑」按钮，点击打开 CodeMirror 多文件模态窗口。
 */
export function CodeBlockComponent({ nodeKey, files }: CodeBlockComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [editable, setEditable] = useState(() => editor.isEditable());
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => editor.registerEditableListener(setEditable), [editor]);

  // 文件数量变化（例如模态窗口删掉了标签页）后收敛激活下标
  useEffect(() => {
    setActiveIndex((index) => Math.min(index, files.length - 1));
  }, [files.length]);

  const activeFile = files[Math.min(activeIndex, files.length - 1)];
  const multi = files.length > 1;

  const tabLabel = (file: CodeFile, index: number) =>
    file.name?.trim() || resolveLanguage(file) || `文件 ${index + 1}`;

  const handleSave = (nextFiles: CodeFile[]) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isCodeBlockNode(node)) node.setFiles(nextFiles);
    });
  };

  return (
    <div
      className="group/block relative overflow-hidden rounded-lg border border-vl-border bg-vl-code-bg"
      data-node-key={nodeKey}
    >
      <div className={`${blockHeader} bg-vl-surface-muted`}>
        {multi ? (
          <div className="flex items-center gap-0.5 overflow-x-auto" role="tablist">
            {files.map((file, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                className="cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-2.5 py-1.5 font-mono text-xs whitespace-nowrap text-vl-text-muted hover:text-vl-text aria-selected:border-b-vl-brand aria-selected:text-vl-brand"
                // 阻止 selection 变化，标签切换只是视图行为
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setActiveIndex(index)}
              >
                {tabLabel(file, index)}
              </button>
            ))}
          </div>
        ) : (
          <span className="select-none px-1.5 font-mono text-xs text-vl-text-muted">
            {tabLabel(activeFile, 0)}
          </span>
        )}
        {editable ? (
          <button
            type="button"
            className={blockEditBtn}
            title="编辑代码块"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setModalOpen(true)}
          >
            编辑
          </button>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <CodePane file={activeFile} />
      </div>
      {modalOpen
        ? createPortal(
            <Suspense fallback={null}>
              <CodeMirrorModal
                initialFiles={files}
                onCancel={() => setModalOpen(false)}
                onSave={(nextFiles) => {
                  handleSave(nextFiles);
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

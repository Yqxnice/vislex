import type { CodeBlockRendererProps, CodeFile } from '@vislex/editor/static';
import { useEffect, useMemo, useState } from 'react';

import * as card from './card.css';
import * as css from './codeBlock.css';
import { highlightCode } from './highlight.js';
import { resolveLanguage } from './languages.js';

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
    <pre className={css.fallbackPre}>
      <code>{file.code}</code>
    </pre>
  );
}

/**
 * 代码块静态渲染器（RendererConfig 的 CodeBlock 槽位）。
 * shiki 双主题高亮 + 多文件标签页切换，与编辑器内静态外观一致（无编辑按钮/模态）。
 */
export function CodeBlockRenderer({ files }: CodeBlockRendererProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // 文件数量变化后收敛激活下标
  useEffect(() => {
    setActiveIndex((index) => Math.min(index, files.length - 1));
  }, [files.length]);

  const activeFile = files[Math.min(activeIndex, files.length - 1)];
  const multi = files.length > 1;

  const tabLabel = (file: CodeFile, index: number) =>
    file.name?.trim() || resolveLanguage(file) || `文件 ${index + 1}`;

  if (!activeFile) return null;

  return (
    <div className={card.blockWrap}>
      <div className={`${card.blockCard} ${css.codeCard}`}>
        <div className={`${card.blockHeader} ${css.headerMuted}`}>
          {multi ? (
            <div className={css.tabList} role="tablist">
              {files.map((file, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  className={css.tab}
                  onClick={() => setActiveIndex(index)}
                >
                  {tabLabel(file, index)}
                </button>
              ))}
            </div>
          ) : (
            <span className={css.singleLabel}>{tabLabel(activeFile, 0)}</span>
          )}
        </div>
        <div className={css.codeScroll}>
          <CodePane file={activeFile} />
        </div>
      </div>
    </div>
  );
}

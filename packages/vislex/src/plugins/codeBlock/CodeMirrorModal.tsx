import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import type { Extension } from '@codemirror/state';
import { Plus, X } from 'lucide-react';
import type { CodeFile } from './CodeBlockNode';
import { COMMON_LANGUAGES, languageFromFilename, normalizeLanguage, resolveLanguage } from './languages';
import {
  modal,
  modalBackdrop,
  modalBtn,
  modalBtnPrimary,
  modalClose,
  modalFields,
  modalFooter,
  modalHeader,
  modalInput,
  modalTitle,
} from '../../ui/classes';

/** 监听 html 上的 .dark 类（admin 的暗色方案挂在 documentElement） */
function useDarkMode(): boolean {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

interface CodeMirrorModalProps {
  initialFiles: CodeFile[];
  onSave: (files: CodeFile[]) => void;
  onCancel: () => void;
}

function normalizeFiles(files: CodeFile[]): CodeFile[] {
  // 丢掉完全为空的文件（多文件场景），再为缺失语言的文件做内容检测
  const kept = files.filter((file, index) => {
    if (files.length === 1) return true;
    return file.code.trim() !== '' || (file.name?.trim() ?? '') !== '' || index === files.length - 1;
  });
  const normalized = kept.map((file) => {
    const name = file.name?.trim() || undefined;
    const explicit = normalizeLanguage(file.language);
    return {
      name,
      code: file.code,
      language: resolveLanguage({ name, language: explicit || undefined, code: file.code }),
    };
  });
  return normalized.length > 0 ? normalized : [{ code: '' }];
}

/**
 * CodeMirror 多文件编辑模态窗口。
 * 标签页 = 文件，每个文件有文件名、语言（自动检测、可手动覆盖）与内容。
 */
export function CodeMirrorModal({ initialFiles, onSave, onCancel }: CodeMirrorModalProps) {
  const dark = useDarkMode();
  const [files, setFiles] = useState<CodeFile[]>(() =>
    initialFiles.length > 0 ? initialFiles.map((file) => ({ ...file })) : [{ code: '' }],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  const active = Math.min(activeIndex, files.length - 1);
  const activeFile = files[active];

  // Esc 关闭；打开时锁定页面滚动
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onCancel]);

  const patchFile = useCallback((index: number, patch: Partial<CodeFile>) => {
    setFiles((prev) => prev.map((file, i) => (i === index ? { ...file, ...patch } : file)));
  }, []);

  const handleFilenameChange = (index: number, name: string) => {
    // 文件名变化时，扩展名能推出语言就同步语言（内容检测在保存时兜底）
    const fromName = languageFromFilename(name);
    patchFile(index, fromName ? { name, language: fromName } : { name });
  };

  const addFile = () => {
    setFiles((prev) => [...prev, { code: '' }]);
    setActiveIndex(files.length);
  };

  const removeFile = (index: number) => {
    if (files.length <= 1) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex((current) => (index < current ? current - 1 : Math.min(current, files.length - 2)));
  };

  const extensions = useMemo<Extension[]>(() => {
    const lang = normalizeLanguage(activeFile?.language) || languageFromFilename(activeFile?.name);
    if (!lang || lang === 'text') return [];
    const extension = loadLanguage(lang as Parameters<typeof loadLanguage>[0]);
    return extension ? [extension] : [];
  }, [activeFile?.language, activeFile?.name]);

  const tabLabel = (file: CodeFile, index: number) =>
    file.name?.trim() || normalizeLanguage(file.language) || `文件 ${index + 1}`;

  return (
    <div className={modalBackdrop} onMouseDown={onCancel}>
      <div
        ref={dialogRef}
        className={modal}
        role="dialog"
        aria-modal="true"
        aria-label="编辑代码块"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={modalHeader}>
          <span className={modalTitle}>编辑代码块</span>
          <button type="button" className={modalClose} aria-label="关闭" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        <div
          className="flex items-center gap-0.5 overflow-x-auto border-b border-vl-border bg-vl-surface-muted px-2.5 pt-1.5"
          role="tablist"
        >
          {files.map((file, index) => (
            <div
              key={index}
              role="tab"
              aria-selected={index === active}
              className="flex cursor-pointer items-center gap-1 rounded-t-lg border border-b-0 border-transparent px-3 py-1.5 pl-3 font-mono text-xs whitespace-nowrap text-vl-text-muted select-none hover:text-vl-text aria-selected:border-vl-border aria-selected:bg-vl-surface aria-selected:text-vl-brand"
              onClick={() => setActiveIndex(index)}
            >
              <span>{tabLabel(file, index)}</span>
              {files.length > 1 ? (
                <button
                  type="button"
                  className="inline-flex size-[18px] cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-[13px] leading-none text-vl-text-muted hover:bg-vl-code-bg hover:text-red-500"
                  aria-label={`删除 ${tabLabel(file, index)}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X size={11} />
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="mb-1 inline-flex h-7 min-w-7 cursor-pointer items-center justify-center rounded-md border border-dashed border-vl-border-strong bg-transparent text-sm text-vl-text-muted hover:border-vl-brand hover:text-vl-brand"
            onClick={addFile}
            title="添加文件"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className={modalFields}>
          <input
            type="text"
            className={modalInput}
            placeholder="文件名（可选），如 index.ts"
            value={activeFile?.name ?? ''}
            onChange={(event) => handleFilenameChange(active, event.target.value)}
          />
          <input
            type="text"
            className={`${modalInput} flex-[0_0_200px]`}
            placeholder="语言（自动检测）"
            list="vislex-lang-list"
            value={activeFile?.language ?? ''}
            onChange={(event) => patchFile(active, { language: event.target.value })}
          />
          <datalist id="vislex-lang-list">
            {COMMON_LANGUAGES.map((lang) => (
              <option key={lang} value={lang} />
            ))}
          </datalist>
        </div>

        <div className="flex-1 overflow-auto text-[13px] [&_.cm-editor]:h-full [&_.cm-editor]:min-h-[260px]">
          <CodeMirror
            value={activeFile?.code ?? ''}
            onChange={(value) => patchFile(active, { code: value })}
            theme={dark ? 'dark' : 'light'}
            extensions={extensions}
            basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true }}
          />
        </div>

        <div className={modalFooter}>
          <button type="button" className={modalBtn} onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className={`${modalBtn} ${modalBtnPrimary}`}
            onClick={() => onSave(normalizeFiles(files))}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

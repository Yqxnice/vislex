import { useCallback, useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import type { Extension } from '@codemirror/state';
import { Plus, X } from 'lucide-react';
import type { CodeFile } from './CodeBlockNode.js';
import {
  COMMON_LANGUAGES,
  languageFromFilename,
  normalizeLanguage,
  resolveLanguage,
} from './languages.js';
import { EditorModal } from '../../ui/EditorModal.js';
import { modalBtn, modalBtnPrimary, modalFields, modalInput } from '../../ui/classes.css';
import * as css from './codeMirrorModal.css';

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

  const active = Math.min(activeIndex, files.length - 1);
  const activeFile = files[active];

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
    <EditorModal
      open
      onClose={onCancel}
      title="编辑代码块"
      footer={
        <>
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
        </>
      }
    >
      <div className={css.tabBar} role="tablist">
        {files.map((file, index) => (
          <div
            key={index}
            role="tab"
            aria-selected={index === active}
            className={css.tab}
            onClick={() => setActiveIndex(index)}
          >
            <span>{tabLabel(file, index)}</span>
            {files.length > 1 ? (
              <button
                type="button"
                className={css.tabClose}
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
          className={css.addFileBtn}
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
          className={`${modalInput} ${css.langInput}`}
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

      <div className={css.editorArea}>
        <CodeMirror
          value={activeFile?.code ?? ''}
          onChange={(value) => patchFile(active, { code: value })}
          theme={dark ? 'dark' : 'light'}
          extensions={extensions}
          basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true }}
        />
      </div>
    </EditorModal>
  );
}

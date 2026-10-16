import { useEffect, useState } from 'react';
import { renderMermaidAsync, renderMermaidSync } from './render';

export interface MermaidRenderState {
  /** 渲染出的 SVG 字符串（失败或为空时为 null） */
  svg: string | null;
  /** 异步引擎的失败信息 */
  error: string | null;
  /** 是否正在异步渲染（官方 mermaid 兜底路径） */
  pending: boolean;
}

/**
 * 图表渲染 hook：先走同步引擎直接出图，不支持的类型再异步兜底。
 * 组件与模态框预览共用，避免渲染逻辑重复。
 */
export function useMermaidSvg(code: string, dark: boolean): MermaidRenderState {
  const [state, setState] = useState<MermaidRenderState>({ svg: null, error: null, pending: false });

  useEffect(() => {
    const trimmed = code.trim();
    if (!trimmed) {
      setState({ svg: null, error: null, pending: false });
      return;
    }

    const sync = renderMermaidSync(trimmed);
    if (sync) {
      setState({ svg: sync, error: null, pending: false });
      return;
    }

    let cancelled = false;
    setState({ svg: null, error: null, pending: true });
    renderMermaidAsync(trimmed, dark)
      .then((svg) => {
        if (!cancelled) setState({ svg, error: null, pending: false });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            svg: null,
            error: error instanceof Error ? error.message : String(error),
            pending: false,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code, dark]);

  return state;
}

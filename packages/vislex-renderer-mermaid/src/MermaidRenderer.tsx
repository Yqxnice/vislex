import type { MermaidRendererProps } from '@vislex/editor/static';

import * as card from './card.css';
import * as css from './mermaid.css';
import { useDarkMode } from './useDarkMode.js';
import { useMermaidSvg } from './useMermaidSvg.js';

/**
 * Mermaid 图表静态渲染器（RendererConfig 的 Mermaid 槽位）。
 * 与编辑器内静态外观一致：blockWrap > blockCard > 头部标签 + 图表正文；
 * 同步引擎直接出图，不支持的类型由官方 mermaid 异步兜底，失败回显源码与错误。
 * 编辑按钮 / 源码模态等编辑态能力已全部剥离。
 */
export function MermaidRenderer({ code }: MermaidRendererProps) {
  const dark = useDarkMode();
  const { svg, error, pending } = useMermaidSvg(code, dark);

  const renderBody = () => {
    if (!code.trim()) {
      return <div className={css.muted}>空图表</div>;
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
    <div className={card.blockWrap}>
      <div className={card.blockCard}>
        <div className={card.blockHeader}>
          <span className={card.blockLabel}>Mermaid</span>
        </div>
        <div className={css.body}>{renderBody()}</div>
      </div>
    </div>
  );
}

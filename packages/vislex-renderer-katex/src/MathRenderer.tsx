import type { MathRendererProps } from '@vislex/editor/static';
import { useMemo } from 'react';

import * as css from './katex.css';
import { renderMath } from './renderMath.js';

/**
 * 公式静态渲染器（RendererConfig 的 Math 槽位）。
 * DOM 结构与编辑器静态外观一致：外层 nodeBlock/nodeInline 包装 + 内容卡片。
 */
export function MathRenderer({ equation, displayMode }: MathRendererProps) {
  const html = useMemo(() => renderMath(equation, displayMode), [equation, displayMode]);

  if (displayMode) {
    return (
      <div className={css.nodeBlock}>
        <div className={css.block}>
          <div
            className={css.blockContent}
            // KaTeX 输出为受信任的同源渲染结果
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    );
  }

  return (
    <span className={css.nodeInline}>
      <span className={css.inline} dangerouslySetInnerHTML={{ __html: html }} />
    </span>
  );
}

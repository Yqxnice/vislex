import type { RubyRendererProps } from '@vislex/editor/static';

import * as css from './ruby.css';

/**
 * Ruby 注音静态渲染器（RendererConfig 的 Ruby 槽位）。
 * 行内 <ruby>base<rt>rt</rt></ruby> 结构，与编辑器静态外观一致
 * （rt 为空时与编辑器一致输出空 <rt>，视觉上仅显示 base），剥离全部编辑交互。
 */
export function RubyRenderer({ base, rt }: RubyRendererProps) {
  return (
    <span className={css.nodeInline}>
      <span className={css.root}>
        <ruby>
          {base}
          <rt>{rt}</rt>
        </ruby>
      </span>
    </span>
  );
}

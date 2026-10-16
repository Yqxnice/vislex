/**
 * 通用 Tailwind 类名常量：模态框、块级卡片（代码块/图表/白板/图库/视频/嵌入共用骨架）。
 * 颜色一律走 vl-* token（桥接 --vislex-* 变量，暗色由 .dark 祖先类翻转变量值）。
 */

/** 等宽字体按钮里常见的 hover 浮现编辑按钮（父容器需带 group/block） */
export const blockEditBtn =
  'cursor-pointer rounded-md border border-vl-border-strong bg-vl-surface px-2.5 py-[3px] text-xs leading-[1.4] text-vl-text-muted opacity-0 transition-[opacity,color,border-color] hover:border-vl-brand hover:text-vl-brand focus-visible:opacity-100 group-hover/block:opacity-100';

/** 块级卡片外层包裹（块与正文的垂直间距） */
export const blockWrap = 'my-2.5';

/** 块级卡片容器：边框 + 圆角 + muted 底色（代码块用 bg-vl-code-bg，单独写） */
export const blockCard =
  'group/block overflow-hidden rounded-lg border border-vl-border bg-vl-surface-muted';

/** 块级卡片头部条 */
export const blockHeader =
  'flex min-h-8 items-center justify-between gap-2 border-b border-vl-border pr-2 pl-3';

/** 块级卡片头部左侧标签（等宽小字） */
export const blockLabel =
  'inline-flex min-w-0 select-none items-center gap-1.5 font-mono text-xs text-vl-text-muted';

/** 模态框遮罩（fixed 全屏居中） */
export const modalBackdrop =
  'fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/45';

/**
 * 模态框容器。必须保留 vislex-modal 钩子类：
 * 模态框经 portal 挂载到 body，脱离 .vislex-root 子树，
 * 变量声明挂在 .vislex-modal 上（styles.css）。
 */
export const modal =
  'vislex-modal flex max-h-[min(720px,100%)] w-[min(880px,100%)] flex-col overflow-hidden rounded-xl border border-vl-border bg-vl-surface text-vl-text shadow-[0_20px_50px_rgba(0,0,0,0.25)] outline-none';

export const modalHeader = 'flex items-center justify-between border-b border-vl-border px-3.5 py-2.5';

export const modalTitle = 'text-sm font-semibold';

export const modalClose =
  'inline-flex size-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-lg leading-none text-vl-text-muted hover:bg-vl-code-bg hover:text-vl-text';

/** 模态框字段区（多文件代码块顶部文件名/语言行） */
export const modalFields = 'flex gap-2 border-b border-vl-border px-3.5 py-2.5';

export const modalInput =
  'min-w-0 flex-1 rounded-md border border-vl-border-strong bg-vl-surface px-2.5 py-1.5 font-mono text-[13px] text-vl-text outline-none focus:border-vl-brand';

export const modalFooter = 'flex justify-end gap-2 border-t border-vl-border px-3.5 py-2.5';

export const modalBtn =
  'cursor-pointer rounded-md border border-vl-border-strong bg-vl-surface px-4 py-1.5 text-[13px] text-vl-text hover:bg-vl-surface-muted';

export const modalBtnPrimary =
  'border-vl-brand bg-vl-brand text-white hover:bg-vl-brand hover:brightness-[1.08]';

/** 模态框主体（flex 列 + 可滚动），数学/图表等弹窗共用 */
export const modalBody = 'flex flex-1 flex-col gap-2.5 overflow-auto p-3.5';

/** 模态框内多行源码输入框（等宽、可纵向拉伸） */
export const modalTextarea =
  'min-h-20 w-full resize-y rounded-lg border border-vl-border-strong bg-vl-surface px-3 py-2.5 font-mono text-[13px] leading-[1.6] text-vl-text outline-none focus:border-vl-brand';

/** 预览区虚框容器 */
export const modalPreview =
  'min-h-12 overflow-x-auto rounded-lg border border-dashed border-vl-border-strong bg-vl-surface-muted px-3.5 py-3';

export const modalPreviewLabel = 'text-xs text-vl-text-muted';

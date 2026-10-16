import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent } from '@lexical/utils';
import { $getNodeByKey, $getSelection, $isRangeSelection } from 'lexical';
import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import { PortalThemeWrapper } from '@vislex/style-token';
import { $isBannerNode, BANNER_TYPES, type BannerType } from './BannerNode.js';
import * as css from './banner.css';

/** 类型 → {图标, 文案} 的单一映射表，工具栏按钮与样式复用 */
export const BANNER_TYPE_META: Record<BannerType, { icon: LucideIcon; label: string }> = {
  info: { icon: Info, label: '信息' },
  success: { icon: CircleCheck, label: '成功' },
  warning: { icon: TriangleAlert, label: '警告' },
  error: { icon: CircleX, label: '错误' },
};

interface ActiveBanner {
  nodeKey: string;
  type: BannerType;
  top: number;
  right: number;
}

/**
 * Banner 类型切换浮动工具条。
 *
 * 监听选区变化：当选区落在某个 BannerNode 内时，在 banner 顶部显示
 * info/success/warning/error 四个切换按钮。点击按钮调用 setBannerType 切换类型。
 *
 * 注意：工具条必须挂在 document.body 上（position: fixed），绝不能 portal 进
 * banner 自身的 DOM —— 那是 Lexical reconciler 管理的子树，混入 React 节点会在
 * Lexical 重排/移除该元素时让 React 的 removeChild 失败。
 */
export function BannerToolbar() {
  const [editor] = useLexicalComposerContext();
  const [active, setActive] = useState<ActiveBanner | null>(null);

  useEffect(() => {
    const compute = () => {
      const next = editor.getEditorState().read<ActiveBanner | null>(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return null;
        const banner = $findMatchingParent(selection.anchor.getNode(), $isBannerNode);
        if (!banner) return null;
        const dom = editor.getElementByKey(banner.getKey());
        if (!dom) return null;
        const rect = dom.getBoundingClientRect();
        return {
          nodeKey: banner.getKey(),
          type: banner.getBannerType(),
          top: rect.top,
          right: window.innerWidth - rect.right,
        };
      });

      setActive((prev) => {
        if (
          prev &&
          next &&
          prev.nodeKey === next.nodeKey &&
          prev.type === next.type &&
          prev.top === next.top &&
          prev.right === next.right
        ) {
          return prev;
        }
        if (!prev && !next) return prev;
        return next;
      });
    };

    compute();
    const unregister = editor.registerUpdateListener(compute);
    window.addEventListener('resize', compute);
    // capture 以捕获编辑器内部滚动容器的滚动
    document.addEventListener('scroll', compute, true);
    return () => {
      unregister();
      window.removeEventListener('resize', compute);
      document.removeEventListener('scroll', compute, true);
    };
  }, [editor]);

  if (!active) return null;

  const setType = (type: BannerType) => {
    editor.update(() => {
      const node = $getNodeByKey(active.nodeKey);
      if ($isBannerNode(node)) node.setBannerType(type);
    });
  };

  return createPortal(
    <PortalThemeWrapper>
      <div
        className={css.toolbar}
        role="toolbar"
        aria-label="提示块类型"
        style={{ top: active.top + 6, right: active.right + 8 }}
      >
        {BANNER_TYPES.map((type) => {
          const meta = BANNER_TYPE_META[type];
          const Icon = meta.icon;
          const isCurrent = type === active.type;
          return (
            <button
              key={type}
              type="button"
              className={`${css.typeBtn} ${css.typeBtnActiveBg[type]}`}
              data-active={isCurrent ? 'true' : 'false'}
              title={meta.label}
              aria-label={meta.label}
              aria-pressed={isCurrent}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setType(type)}
            >
              <span
                className={`${css.typeIconCircle} ${isCurrent ? css.typeIconCurrent : css.typeIconBg[type]}`}
              >
                <Icon size={10} strokeWidth={2.5} />
              </span>
              <span className={css.typeBtnLabel}>{meta.label}</span>
            </button>
          );
        })}
      </div>
    </PortalThemeWrapper>,
    document.body,
  );
}

import { useCallback, useMemo, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import type { TextNode } from 'lexical';
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  type ElementNode,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $createListItemNode, $createListNode } from '@lexical/list';
import { $createCodeBlockEditNode } from '../codeBlock/index.js';
import { $createBannerNode } from '../banner/index.js';
import { $createMermaidEditNode } from '../mermaid/index.js';
import { $createWhiteboardEditNode } from '../whiteboard/index.js';
import { $createGalleryEditNode } from '../gallery/index.js';
import { $createLinkCardNode } from '../linkCard/index.js';
import { $createVideoEditNode } from '../video/index.js';
import { $createEmbedEditNode } from '../embed/index.js';
import { $createInlineMathEditNode, $createBlockMathEditNode } from '../math/nodes.js';
import { OPEN_MATH_MODAL_COMMAND } from '../math/index.js';
import { $createRubyEditNode } from '../ruby/index.js';
import { OPEN_RUBY_MODAL_COMMAND } from '../ruby/commands.js';
import { $createMentionEditNode } from '../mention/index.js';
import { OPEN_MENTION_MODAL_COMMAND } from '../mention/index.js';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { PortalThemeWrapper } from '@vislex/style-token';
import * as css from './slashMenu.css';

/**
 * 斜杠菜单（键入 "/" 触发的块插入菜单）。
 * 纯编辑器 UI：无节点、无 Markdown 转换器、无 core 副本。
 * 选中选项后先移除 "/query" 文本，再按块级 / 行内两类方式插入。
 */
type RunFn = (editor: LexicalEditor, textNodeContainingQuery: TextNode | null) => void;
/** 行内插入后需要返回新节点 key，用于派发编辑弹层命令 */
type InlineRunFn = (editor: LexicalEditor, textNodeContainingQuery: TextNode | null) => string | null;

class SlashOption extends MenuOption {
  title: string;
  icon: JSX.Element;
  keywords: string[];
  run: RunFn;

  constructor(title: string, icon: JSX.Element, keywords: string[], run: RunFn) {
    super(title);
    this.title = title;
    this.icon = icon;
    this.keywords = keywords;
    this.run = run;
  }
}

/** 把当前光标所在顶层块替换 / 插入为块级节点，其后补空段落并落焦点 */
function insertBlock(build: () => LexicalNode): RunFn {
  return (editor, textNodeContainingQuery) => {
    editor.update(() => {
      textNodeContainingQuery?.remove();
      const selection = $getSelection();
      const anchorBlock = $isRangeSelection(selection)
        ? selection.anchor.getNode().getTopLevelElement()
        : null;
      const node = build();

      const emptyParagraph =
        anchorBlock && $isParagraphNode(anchorBlock) && anchorBlock.getTextContent().trim() === '';

      if (emptyParagraph && anchorBlock) {
        anchorBlock.replace(node);
      } else if (anchorBlock) {
        anchorBlock.insertAfter(node);
      } else {
        $getRoot().append(node);
      }

      const paragraph = $createParagraphNode();
      node.insertAfter(paragraph);
      paragraph.select();
    });
  };
}

/** 把光标所在顶层块替换 / 插入为另一种块级容器（标题、引用等），焦点进入其内部 */
function wrapBlock(build: () => ElementNode): RunFn {
  return (editor, textNodeContainingQuery) => {
    editor.update(() => {
      textNodeContainingQuery?.remove();
      const selection = $getSelection();
      const anchorBlock = $isRangeSelection(selection)
        ? selection.anchor.getNode().getTopLevelElement()
        : null;
      const node = build();

      const emptyParagraph =
        anchorBlock && $isParagraphNode(anchorBlock) && anchorBlock.getTextContent().trim() === '';

      if (emptyParagraph && anchorBlock) {
        anchorBlock.replace(node);
      } else if (anchorBlock) {
        anchorBlock.insertAfter(node);
      } else {
        $getRoot().append(node);
      }
      node.select();
    });
  };
}

/** 在光标处插入行内节点 */
function insertInline(build: () => LexicalNode): InlineRunFn {
  return (editor, textNodeContainingQuery) => {
    let pendingKey: string | null = null;
    editor.update(() => {
      textNodeContainingQuery?.remove();
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const node = build();
      selection.insertNodes([node]);
      pendingKey = node.getKey();
    });
    return pendingKey;
  };
}

function buildOptions(): SlashOption[] {
  return [
    new SlashOption('标题 1', <span className={css.itemGlyph}>H1</span>, ['heading', '标题', 'h1'], wrapBlock(() => $createHeadingNode('h1'))),
    new SlashOption('标题 2', <span className={css.itemGlyph}>H2</span>, ['heading', '标题', 'h2'], wrapBlock(() => $createHeadingNode('h2'))),
    new SlashOption('标题 3', <span className={css.itemGlyph}>H3</span>, ['heading', '标题', 'h3'], wrapBlock(() => $createHeadingNode('h3'))),
    new SlashOption('无序列表', <span className={css.itemGlyph}>•≡</span>, ['list', 'bullet', '列表', '无序'], insertBlock(() => {
      const list = $createListNode('bullet');
      list.append($createListItemNode());
      return list;
    })),
    new SlashOption('有序列表', <span className={css.itemGlyph}>1≡</span>, ['list', 'number', 'ordered', '列表', '有序'], insertBlock(() => {
      const list = $createListNode('number');
      list.append($createListItemNode());
      return list;
    })),
    new SlashOption('引用', <span className={css.itemGlyph}>❝</span>, ['quote', 'blockquote', '引用'], wrapBlock(() => $createQuoteNode())),
    new SlashOption('代码块', <span className={css.itemGlyph}>{}</span>, ['code', '代码', 'codeblock'], insertBlock(() => $createCodeBlockEditNode())),
    new SlashOption('横幅 · 信息', <span className={css.itemGlyph}>i</span>, ['banner', 'info', '横幅', '提示'], insertBlock(() => $createBannerNode('info'))),
    new SlashOption('横幅 · 成功', <span className={css.itemGlyph}>✓</span>, ['banner', 'success', '横幅', '成功'], insertBlock(() => $createBannerNode('success'))),
    new SlashOption('横幅 · 警告', <span className={css.itemGlyph}>!</span>, ['banner', 'warning', '横幅', '警告'], insertBlock(() => $createBannerNode('warning'))),
    new SlashOption('横幅 · 错误', <span className={css.itemGlyph}>✕</span>, ['banner', 'error', '横幅', '错误'], insertBlock(() => $createBannerNode('error'))),
    new SlashOption('行内公式', <span className={css.itemGlyph}>∑</span>, ['math', 'formula', '公式', '行内'], (editor, textNode) => {
      const key = insertInline(() => $createInlineMathEditNode(''))(editor, textNode);
      if (key) setTimeout(() => editor.dispatchCommand(OPEN_MATH_MODAL_COMMAND, { nodeKey: key }), 0);
    }),
    new SlashOption('块级公式', <span className={css.itemGlyph}>∑∑</span>, ['math', 'formula', '公式', '块级'], (editor, textNode) => {
      const key = insertInline(() => $createBlockMathEditNode(''))(editor, textNode);
      if (key) setTimeout(() => editor.dispatchCommand(OPEN_MATH_MODAL_COMMAND, { nodeKey: key }), 0);
    }),
    new SlashOption('Mermaid 图表', <span className={css.itemGlyph}>◷</span>, ['mermaid', 'diagram', '图表', '流程图'], insertBlock(() => $createMermaidEditNode(''))),
    new SlashOption('图库', <span className={css.itemGlyph}>▣</span>, ['gallery', 'image', '图库', '图片'], insertBlock(() => $createGalleryEditNode())),
    new SlashOption('白板', <span className={css.itemGlyph}>✎</span>, ['whiteboard', 'draw', '白板', '画板'], insertBlock(() => $createWhiteboardEditNode())),
    new SlashOption('链接卡片', <span className={css.itemGlyph}>🔗</span>, ['linkcard', 'card', '链接', '卡片'], insertBlock(() => $createLinkCardNode(''))),
    new SlashOption('视频', <span className={css.itemGlyph}>▶</span>, ['video', '视频', '媒体'], insertBlock(() => $createVideoEditNode())),
    new SlashOption('嵌入', <span className={css.itemGlyph}>⿴</span>, ['embed', 'iframe', '嵌入'], insertBlock(() => $createEmbedEditNode())),
    new SlashOption('表格', <span className={css.itemGlyph}>▦</span>, ['table', '表格'], (editor, textNode) => {
      editor.update(() => {
        textNode?.remove();
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
          rows: '3',
          columns: '3',
          includeHeaders: { rows: true, columns: false },
        });
      });
    }),
    new SlashOption('Ruby 注音', <span className={css.itemGlyph}>字</span>, ['ruby', '注音', '拼音', 'furigana'], (editor, textNode) => {
      const key = insertInline(() => $createRubyEditNode('', ''))(editor, textNode);
      if (key) setTimeout(() => editor.dispatchCommand(OPEN_RUBY_MODAL_COMMAND, { nodeKey: key }), 0);
    }),
    new SlashOption('提及', <span className={css.itemGlyph}>@</span>, ['mention', '提及', 'at'], (editor, textNode) => {
      const key = insertInline(() => $createMentionEditNode(''))(editor, textNode);
      if (key) setTimeout(() => editor.dispatchCommand(OPEN_MENTION_MODAL_COMMAND, { nodeKey: key }), 0);
    }),
  ];
}

export function SlashMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const options = useMemo(buildOptions, []);

  const triggerFn = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
    maxLength: 30,
  });

  const filteredOptions = useMemo(() => {
    const query = queryString?.trim().toLowerCase() ?? '';
    if (!query) return options;
    return options.filter(
      (option) =>
        option.title.toLowerCase().includes(query) ||
        option.keywords.some((keyword) => keyword.toLowerCase().includes(query)),
    );
  }, [options, queryString]);

  const onSelectOption = useCallback(
    (option: SlashOption, textNodeContainingQuery: TextNode | null, close: () => void) => {
      close();
      option.run(editor, textNodeContainingQuery);
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<SlashOption>
      options={filteredOptions}
      onQueryChange={setQueryString}
      triggerFn={triggerFn}
      onSelectOption={onSelectOption}
      menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
        if (!anchorElementRef.current || filteredOptions.length === 0) return null;
        return createPortal(
          <PortalThemeWrapper>
            <div className={css.menu} role="menu">
              {filteredOptions.map((option, index) => (
                <button
                  key={option.key}
                  type="button"
                  role="menuitem"
                  className={css.item}
                  data-active={index === selectedIndex}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOptionAndCleanUp(option)}
                >
                  <span className={css.itemIcon}>{option.icon}</span>
                  <span className={css.itemTitle}>{option.title}</span>
                </button>
              ))}
            </div>
          </PortalThemeWrapper>,
          anchorElementRef.current,
        );
      }}
    />
  );
}

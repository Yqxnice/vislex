import { $getSelectionStyleValueForProperty, $patchStyleText } from '@lexical/selection';
import { $getSelection, $isRangeSelection } from 'lexical';
import type { EditorPlugin, ToolbarSelectItem } from '../types.js';

/**
 * 预设字体列表。
 * value 为 CSS font-family 完整栈，label 为显示名。
 * 第一项为空字符串表示「不指定字体」（清除 font-family 内联样式，继承默认）。
 */
const FONT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: '默认字体' },
  { value: '"SimSun", "宋体", serif', label: '宋体' },
  { value: '"SimHei", "黑体", sans-serif', label: '黑体' },
  { value: '"Microsoft YaHei", "微软雅黑", sans-serif', label: '微软雅黑' },
  { value: '"KaiTi", "楷体", serif', label: '楷体' },
  { value: '"FangSong", "仿宋", serif', label: '仿宋' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
  { value: '"Courier New", Courier, monospace', label: 'Courier New' },
];

/** 取 font-family 栈的第一个字体名（去引号、去空白、转小写），用于跨浏览器归一化匹配 */
function firstFont(stack: string): string {
  return (
    stack
      .split(',')[0]
      ?.trim()
      .replace(/^['"]|['"]$/g, '')
      .toLowerCase() ?? ''
  );
}

/** 把当前选区的 font-family 归一化到 FONT_OPTIONS 中某一项的 value */
function currentFontValue(): string {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return '';
  const raw = $getSelectionStyleValueForProperty(selection, 'font-family', '');
  if (!raw) return '';
  const first = firstFont(raw);
  if (!first) return '';
  const match = FONT_OPTIONS.find((opt) => opt.value && firstFont(opt.value) === first);
  return match ? match.value : '';
}

const fontFamilyItem: ToolbarSelectItem = {
  id: 'font-family',
  type: 'select',
  title: '字体',
  options: FONT_OPTIONS,
  value: currentFontValue,
  // Toolbar 已在 editor.update 上下文中调用并恢复了选区，直接打样式即可
  onChange: (_editor, value) => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    // value 为空时传 null，清除 font-family 内联样式
    $patchStyleText(selection, { 'font-family': value || null });
  },
};

/** 字体选择：通过内联 style 的 font-family 应用到选中文本 */
export const fontPlugin: EditorPlugin = {
  name: 'font',
  toolbar: [fontFamilyItem],
};

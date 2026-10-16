/** 块级卡片骨架（与编辑器 ui/classes.css 的 blockWrap 同源，去掉编辑按钮联动） */
import { style } from '@vanilla-extract/css';

/** 块级卡片外层包裹（块与正文的垂直间距，对应 LinkCardNode createDOM 的 blockWrap） */
export const blockWrap = style({
  margin: '10px 0',
});

import { $getRoot } from 'lexical';
import { jsonToLiteXML } from './litexml.bridge.js';

/**
 * 编辑器实例级导出：把当前编辑器内容序列化成 LiteXML 文档。
 *
 * 词汇表与遍历逻辑统一在 litexml.bridge.ts（纯 JSON 层，Node 也可用），
 * 这里只是 read 上下文里的薄封装；导入侧（deserialize.ts）与之互为往返。
 */
export function $exportLiteXML(): string {
  return jsonToLiteXML({ root: $getRoot().exportJSON() });
}

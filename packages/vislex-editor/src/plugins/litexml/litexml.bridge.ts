/**
 * LiteXML 纯 JSON↔XML 双向桥：编辑器侧 re-export 薄封装。
 *
 * 唯一实现（含词汇表规格与 mini XML 解析器）位于 @vislex/litexml，
 * 编辑器实例级导入导出（serialize.ts / deserialize.ts）与服务端
 * （@vislex/headless、apps/core）共用同一份代码。
 */
export { jsonToLiteXML, liteXMLToJson } from '@vislex/litexml';

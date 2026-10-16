/**
 * Mermaid 图表 Markdown 转换器：编辑器侧注入可编辑的 MermaidEditNode，
 * 转换逻辑的唯一实现位于 @vislex/headless（createMermaidTransformers 工厂）。
 */

import { createMermaidTransformers } from '@vislex/headless';
import { $createMermaidEditNode } from './MermaidEditNode.js';
import { $isMermaidNode, MermaidNode } from './MermaidNode.js';

export const MERMAID_TRANSFORMERS = createMermaidTransformers({
  MermaidNode,
  createMermaidNode: $createMermaidEditNode,
  isMermaidNode: $isMermaidNode,
});

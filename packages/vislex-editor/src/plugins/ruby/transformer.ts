/**
 * Ruby 注音 Markdown 转换器：编辑器侧注入可编辑的 RubyEditNode，
 * 转换逻辑的唯一实现位于 @vislex/headless（createRubyTransformers 工厂）。
 */

import { createRubyTransformers } from '@vislex/headless';
import { $createRubyEditNode } from './RubyEditNode.js';
import { $isRubyNode, RubyNode } from './RubyNode.js';

export const RUBY_TRANSFORMERS = createRubyTransformers({
  RubyNode,
  createRubyNode: $createRubyEditNode,
  isRubyNode: $isRubyNode,
});

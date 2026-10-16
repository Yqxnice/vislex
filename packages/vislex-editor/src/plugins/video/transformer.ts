/**
 * 视频 Markdown 转换器：编辑器侧注入可编辑的 VideoEditNode，
 * 转换逻辑的唯一实现位于 @vislex/headless（createVideoTransformers 工厂）。
 */

import { createVideoTransformers } from '@vislex/headless';
import { $createVideoEditNode } from './VideoEditNode.js';
import { $isVideoNode, VideoNode } from './VideoNode.js';

export const VIDEO_TRANSFORMERS = createVideoTransformers({
  VideoNode,
  createVideoNode: $createVideoEditNode,
  isVideoNode: $isVideoNode,
});

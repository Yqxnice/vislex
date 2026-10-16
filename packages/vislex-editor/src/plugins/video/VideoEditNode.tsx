import type { LexicalNode } from 'lexical';
import type { JSX } from 'react';
import { VideoComponent } from './VideoComponent.js';
import { VideoNode, type SerializedVideoNode } from './VideoNode.js';

function optionalString(raw: unknown): string | undefined {
  return typeof raw === 'string' && raw.trim() !== '' ? raw : undefined;
}

/** 编辑态视频节点：与 VideoNode 共享 type 字符串，decorate 交给组件跟踪编辑器可编辑态 */
export class VideoEditNode extends VideoNode {
  // Lexical 0.52 要求具体节点类自带 own static getType（否则 DEV 告警）
  static getType(): string {
    return 'video';
  }

  static clone(node: VideoEditNode): VideoEditNode {
    return new VideoEditNode(node.__src, node.__poster, node.__title, node.__key);
  }

  static importJSON(serialized: SerializedVideoNode): VideoEditNode {
    return new VideoEditNode(
      typeof serialized.src === 'string' ? serialized.src : '',
      optionalString(serialized.poster),
      optionalString(serialized.title),
    ).updateFromJSON(serialized);
  }

  decorate(): JSX.Element {
    return (
      <VideoComponent
        nodeKey={this.getKey()}
        src={this.getSrc()}
        poster={this.getPoster()}
        title={this.getTitle()}
      />
    );
  }
}

export function $createVideoEditNode(src?: string): VideoEditNode {
  return new VideoEditNode(src);
}

export function $isVideoEditNode(node: LexicalNode | null | undefined): node is VideoEditNode {
  return node instanceof VideoEditNode;
}

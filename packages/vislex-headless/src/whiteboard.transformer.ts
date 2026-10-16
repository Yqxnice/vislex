/**
 * 白板 Markdown 转换器（headless / editor 共用单一实现）。
 * 通过 createWhiteboardTransformers(deps) 注入当前环境注册的节点类。
 * Markdown 格式（```whiteboard 围栏，围栏体为 {mode, scene, src, patch} 的 JSON）。
 *
 * 注意：本转换器必须排在代码块转换器之前，
 * 否则 ```whiteboard 会被通用围栏规则吞成普通代码块。
 */

import { $createParagraphNode, type ElementNode, type Klass, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import type { WhiteboardMode, WhiteboardNode } from './whiteboard.node.js';
import {
  $createWhiteboardNode,
  $isWhiteboardNode,
  WhiteboardNode as HeadlessWhiteboardNode,
} from './whiteboard.node.js';

const WHITEBOARD_START_REGEX = /^[ \t]*`{3,}[ \t]*(?:whiteboard|excalidraw)[ \t]*$/;
const FENCE_END_REGEX = /^[ \t]*`{3,}[ \t]*$/;

const MODES: WhiteboardMode[] = ['inline', 'remote', 'delta'];

function normalizeMode(value: unknown): WhiteboardMode {
  return MODES.includes(value as WhiteboardMode) ? (value as WhiteboardMode) : 'inline';
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

interface WhiteboardPayload {
  mode: WhiteboardMode;
  scene: string;
  src: string;
  patch: string;
}

function parsePayload(body: string): WhiteboardPayload {
  const empty: WhiteboardPayload = { mode: 'inline', scene: '', src: '', patch: '' };
  const trimmed = body.trim();
  if (!trimmed) return empty;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return empty;
  }
  if (!parsed || typeof parsed !== 'object') return empty;

  const data = parsed as Record<string, unknown>;
  if (data.mode === undefined && Array.isArray(data.elements)) {
    return { ...empty, scene: trimmed };
  }
  return {
    mode: normalizeMode(data.mode),
    scene: str(data.scene),
    src: str(data.src),
    patch: str(data.patch),
  };
}

export interface WhiteboardTransformersDeps {
  WhiteboardNode: Klass<LexicalNode>;
  createWhiteboardNode: (
    mode?: WhiteboardMode,
    scene?: string,
    src?: string,
    patch?: string,
  ) => LexicalNode;
  isWhiteboardNode: (node: LexicalNode | null | undefined) => boolean;
}

export function createWhiteboardTransformers(
  deps: WhiteboardTransformersDeps,
): MultilineElementTransformer[] {
  const whiteboardTransformer: MultilineElementTransformer = {
    type: 'multiline-element',
    dependencies: [deps.WhiteboardNode],
    regExpStart: WHITEBOARD_START_REGEX,
    regExpEnd: { optional: true, regExp: FENCE_END_REGEX },

    export: (node: LexicalNode) => {
      if (!deps.isWhiteboardNode(node)) return null;
      const n = node as WhiteboardNode;
      const payload = {
        mode: n.getMode(),
        scene: n.getScene(),
        src: n.getSrc(),
        patch: n.getPatch(),
      };
      return `\`\`\`whiteboard\n${JSON.stringify(payload, null, 2)}\n\`\`\``;
    },

    replace: (
      rootNode: ElementNode,
      children: LexicalNode[] | null,
      _startMatch: string[],
      _endMatch: string[] | null,
      linesInBetween: string[] | null,
      isImport: boolean,
    ) => {
      if (!children && linesInBetween) {
        const lines = [...linesInBetween];
        if (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
        while (lines.length > 0 && lines[lines.length - 1].length === 0) lines.pop();
        const payload = parsePayload(lines.join('\n'));
        rootNode.append(
          deps.createWhiteboardNode(payload.mode, payload.scene, payload.src, payload.patch),
        );
        return true;
      }

      if (children) {
        if (!isImport) {
          const node = deps.createWhiteboardNode();
          rootNode.replace(node);
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
        }
        return true;
      }
      return false;
    },
  };

  return [whiteboardTransformer];
}

/** headless 默认绑定（零 React 节点） */
export const WHITEBOARD_TRANSFORMERS: MultilineElementTransformer[] = createWhiteboardTransformers({
  WhiteboardNode: HeadlessWhiteboardNode,
  createWhiteboardNode: $createWhiteboardNode,
  isWhiteboardNode: $isWhiteboardNode,
});

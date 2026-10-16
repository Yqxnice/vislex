import { $createParagraphNode, type ElementNode, type LexicalNode } from 'lexical';
import type { MultilineElementTransformer } from '@lexical/markdown';
import {
  $createWhiteboardNode,
  $isWhiteboardNode,
  WhiteboardNode,
  type WhiteboardMode,
} from './WhiteboardNode';

/**
 * 白板 Markdown 往返。
 *
 * 格式：```whiteboard
 *       { "mode": "remote", "src": "/api/files/xxx.json", ... }
 *       ```
 * 围栏体统一是节点数据的 JSON 文本（mode / scene / src / patch），
 * 三种存储策略共用一种围栏，不做额外语法分支。
 *
 * 注意：本转换器必须排在代码块转换器之前，
 * 否则 ```whiteboard 会被通用围栏规则吞成普通代码块。
 * 服务端 core 内有一份同构副本（格式需保持一致）。
 */

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

/**
 * 解析围栏体。
 * - 空体视为空的内联白板；
 * - 合法的节点数据 JSON 按字段取值；
 * - 直接粘贴的 Excalidraw 原生 JSON（无 mode 字段但有 elements）按内联场景接收，避免丢内容。
 */
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

const whiteboardTransformer: MultilineElementTransformer = {
  type: 'multiline-element',
  dependencies: [WhiteboardNode],
  regExpStart: WHITEBOARD_START_REGEX,
  regExpEnd: { optional: true, regExp: FENCE_END_REGEX },

  export: (node: LexicalNode) => {
    if (!$isWhiteboardNode(node)) return null;
    const payload = {
      mode: node.getMode(),
      scene: node.getScene(),
      src: node.getSrc(),
      patch: node.getPatch(),
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
    // 导入：linesInBetween[0] 是起始行剩余部分，空白则丢弃
    if (!children && linesInBetween) {
      const lines = [...linesInBetween];
      if (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
      while (lines.length > 0 && lines[lines.length - 1].length === 0) lines.pop();
      const payload = parsePayload(lines.join('\n'));
      rootNode.append(
        $createWhiteboardNode(payload.mode, payload.scene, payload.src, payload.patch),
      );
      return true;
    }

    // 输入快捷键：把当前段落替换成空白板，光标落到后面的新段落
    if (children) {
      if (!isImport) {
        const node = $createWhiteboardNode();
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

export const WHITEBOARD_TRANSFORMERS: MultilineElementTransformer[] = [whiteboardTransformer];

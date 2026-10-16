/**
 * 白板场景数据与「基础快照 + JSON 差值补丁」策略的公共逻辑。
 * 与编辑器 plugins/whiteboard/scene.ts 同源（静态渲染只消费解析侧，
 * diffScenes 等写侧函数一并保留，保证与编辑器单源一致）。
 *
 * 场景对象沿用 Excalidraw 的原生文件结构（.excalidraw），
 * appState 只保留视图相关的少量键，避免选中态、协作态等易变数据进文档。
 */

/** Excalidraw 元素（此处只依赖 id 字段，其余原样透传） */
export interface WhiteboardElement {
  id: string;
  [key: string]: unknown;
}

/** 持久化的场景结构 */
export interface WhiteboardScene {
  type: 'excalidraw';
  version: number;
  source: string;
  elements: WhiteboardElement[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
}

/** 需要持久化的 appState 键（对齐 Excalidraw 导出文件的裁剪范围） */
export const PERSISTED_APP_STATE_KEYS = [
  'viewBackgroundColor',
  'gridSize',
  'gridStep',
  'gridModeEnabled',
  'theme',
];

/** RFC6902 补丁操作（只生成与消费 add / remove / replace / move 四种） */
export type JsonPatchOp =
  | { op: 'add'; path: string; value: unknown }
  | { op: 'remove'; path: string }
  | { op: 'replace'; path: string; value: unknown }
  | { op: 'move'; from: string; path: string };

export function emptyScene(): WhiteboardScene {
  return {
    type: 'excalidraw',
    version: 2,
    source: 'vislex',
    elements: [],
    appState: {},
    files: {},
  };
}

/** 从 Excalidraw onChange 的 appState 里挑出需要持久化的键 */
export function pickAppState(appState: Record<string, unknown>): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const key of PERSISTED_APP_STATE_KEYS) {
    if (appState[key] !== undefined) picked[key] = appState[key];
  }
  return picked;
}

/** 容错解析场景文本；解析失败或结构不符时返回空场景 */
export function parseScene(text: string): WhiteboardScene {
  if (!text.trim()) return emptyScene();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return emptyScene();
  }
  return normalizeScene(parsed);
}

/** 把任意解析结果规整成场景结构 */
export function normalizeScene(value: unknown): WhiteboardScene {
  if (!value || typeof value !== 'object') return emptyScene();
  const data = value as Record<string, unknown>;
  const base = emptyScene();
  return {
    type: 'excalidraw',
    version: typeof data.version === 'number' ? data.version : base.version,
    source: typeof data.source === 'string' ? data.source : base.source,
    elements: Array.isArray(data.elements) ? (data.elements as WhiteboardElement[]) : [],
    appState:
      data.appState && typeof data.appState === 'object'
        ? pickAppState(data.appState as Record<string, unknown>)
        : {},
    files: data.files && typeof data.files === 'object' ? (data.files as Record<string, unknown>) : {},
  };
}

export function stringifyScene(scene: WhiteboardScene): string {
  return JSON.stringify(scene);
}

// ===== JSON Pointer =====

function escapePointerToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}

function unescapePointerToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

function parsePointer(pointer: string): string[] {
  if (pointer === '') return [];
  if (!pointer.startsWith('/')) throw new Error(`非法 JSON Pointer：${pointer}`);
  return pointer.slice(1).split('/').map(unescapePointerToken);
}

/** 读取指针指向的值 */
function getAt(target: unknown, pointer: string): unknown {
  let cur: unknown = target;
  for (const token of parsePointer(pointer)) {
    if (Array.isArray(cur)) {
      const index = Number(token);
      cur = cur[index];
    } else if (cur && typeof cur === 'object') {
      cur = (cur as Record<string, unknown>)[token];
    } else {
      return undefined;
    }
  }
  return cur;
}

/**
 * 应用 RFC6902 补丁（支持 add / remove / replace / move）。
 * 只消费本模块 diffScenes 生成的补丁，因此不做额外容错：
 * 指针不存在时直接报错，避免静默产出错误场景。
 */
export function applyJsonPatch(target: unknown, ops: JsonPatchOp[]): unknown {
  let root = target;

  for (const op of ops) {
    const tokens = parsePointer(op.path);
    if (tokens.length === 0) {
      if (op.op !== 'add' && op.op !== 'replace') {
        throw new Error(`补丁根路径不支持 ${op.op} 操作`);
      }
      root = op.value;
      continue;
    }
    const parentTokens = tokens.slice(0, -1);
    const lastToken = tokens[tokens.length - 1];
    const parent =
      parentTokens.length === 0
        ? root
        : getAt(root, `/${parentTokens.map(escapePointerToken).join('/')}`);

    if (op.op === 'move') {
      const fromTokens = parsePointer(op.from);
      const fromParent = fromTokens.length === 1 ? root : getAt(root, `/${fromTokens.slice(0, -1).map(escapePointerToken).join('/')}`);
      const [moved] = removeAt(fromParent, fromTokens[fromTokens.length - 1]);
      insertAt(parent, lastToken, moved);
      continue;
    }

    if (op.op === 'remove') {
      removeAt(parent, lastToken);
      continue;
    }

    if (op.op === 'replace') {
      if (Array.isArray(parent)) {
        parent[Number(lastToken)] = op.value;
      } else if (parent && typeof parent === 'object') {
        (parent as Record<string, unknown>)[lastToken] = op.value;
      }
      continue;
    }

    // add
    insertAt(parent, lastToken, op.value);
    if (parentTokens.length === 0) root = op.value;
  }

  return root;
}

function removeAt(parent: unknown, token: string): [unknown] {
  if (Array.isArray(parent)) {
    const index = Number(token);
    return parent.splice(index, 1) as [unknown];
  }
  if (parent && typeof parent === 'object') {
    const record = parent as Record<string, unknown>;
    const value = record[token];
    delete record[token];
    return [value];
  }
  throw new Error('补丁目标不存在的父节点');
}

function insertAt(parent: unknown, token: string, value: unknown): void {
  if (Array.isArray(parent)) {
    // 数组的 "-" 表示追加到末尾
    const index = token === '-' ? parent.length : Number(token);
    parent.splice(index, 0, value);
    return;
  }
  if (parent && typeof parent === 'object') {
    (parent as Record<string, unknown>)[token] = value;
    return;
  }
  throw new Error('补丁目标不存在的父节点');
}

// ===== 场景差值 =====

function same(a: unknown, b: unknown): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

/**
 * 计算「基础快照 → 当前场景」的差值补丁。
 *
 * 粒度：
 * - elements 按 id 逐条比对，只产生增 / 删 / 移 / 改（元素是原子单位，改动即整条替换）；
 * - files 按 key 逐项比对；
 * - appState 已在 pickAppState 裁剪过，直接整体替换。
 *
 * 数组补丁的下标按「应用时刻」计算：生成过程中同步维护一份工作副本，
 * 保证生成顺序与 applyJsonPatch 的逐条应用结果一致。
 */
export function diffScenes(base: WhiteboardScene, next: WhiteboardScene): JsonPatchOp[] {
  const ops: JsonPatchOp[] = [];

  if (!same(base.appState, next.appState)) {
    ops.push({ op: 'replace', path: '/appState', value: next.appState });
  }

  for (const key of Object.keys(base.files ?? {})) {
    if (!(key in (next.files ?? {}))) {
      ops.push({ op: 'remove', path: `/files/${escapePointerToken(key)}` });
    }
  }
  for (const key of Object.keys(next.files ?? {})) {
    const pointer = `/files/${escapePointerToken(key)}`;
    if (!(key in (base.files ?? {}))) {
      ops.push({ op: 'add', path: pointer, value: next.files[key] });
    } else if (!same(base.files[key], next.files[key])) {
      ops.push({ op: 'replace', path: pointer, value: next.files[key] });
    }
  }

  const baseElements = Array.isArray(base.elements) ? base.elements : [];
  const nextElements = Array.isArray(next.elements) ? next.elements : [];

  if (baseElements.length === 0) {
    if (nextElements.length > 0) {
      ops.push({ op: 'add', path: '/elements', value: nextElements });
    }
    return ops;
  }

  const working = [...baseElements];
  for (let i = 0; i < nextElements.length; i++) {
    const target = nextElements[i];
    const current = working[i];
    if (current && current.id === target.id) {
      if (!same(current, target)) {
        ops.push({ op: 'replace', path: `/elements/${i}`, value: target });
        working[i] = target;
      }
      continue;
    }

    const found = working.findIndex((element, index) => index >= i && element.id === target.id);
    if (found >= 0) {
      ops.push({ op: 'move', from: `/elements/${found}`, path: `/elements/${i}` });
      const [moved] = working.splice(found, 1);
      working.splice(i, 0, moved);
      if (!same(working[i], target)) {
        ops.push({ op: 'replace', path: `/elements/${i}`, value: target });
        working[i] = target;
      }
    } else {
      ops.push({ op: 'add', path: `/elements/${i}`, value: target });
      working.splice(i, 0, target);
    }
  }

  for (let i = working.length - 1; i >= nextElements.length; i--) {
    ops.push({ op: 'remove', path: `/elements/${i}` });
  }

  return ops;
}

/** 用基础快照 + 补丁文本重建完整场景 */
export function resolveDeltaScene(base: WhiteboardScene, patchText: string): WhiteboardScene {
  const trimmed = patchText.trim();
  if (!trimmed) return base;
  let ops: unknown;
  try {
    ops = JSON.parse(trimmed);
  } catch {
    throw new Error('差值补丁不是合法 JSON');
  }
  if (!Array.isArray(ops)) throw new Error('差值补丁必须是 RFC6902 操作数组');
  return normalizeScene(applyJsonPatch(base, ops as JsonPatchOp[]));
}

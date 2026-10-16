import type { LinkCardData } from '../LinkCardNode';

/**
 * Link Card Matcher 契约。
 *
 * 每个 matcher 负责：
 * - match(url): 判断能否处理该 URL（通常按 host + path pattern）
 * - fetch(url): 异步拉取结构化数据；失败应 throw，组件层会捕获并降级展示
 *
 * 匹配优先级：最后注册的先尝试（允许自定义 matcher 覆盖内置）。
 */
export interface LinkCardMatcher {
  /** 唯一标识，持久化到节点 JSON 的 matcherName 字段 */
  name: string;
  /** 判断是否匹配（传入的 URL 已通过 new URL() 解析） */
  match: (url: URL) => boolean;
  /** 拉取数据；返回的数据 shape 决定卡片布局（可覆盖传入的默认 shape） */
  fetch: (url: URL) => Promise<LinkCardData>;
}

// --- 注册表 ---

const registry = new Map<string, LinkCardMatcher>();

/** 注册一个 matcher；同名会覆盖 */
export function registerMatcher(matcher: LinkCardMatcher): void {
  registry.set(matcher.name, matcher);
}

/** 注销一个 matcher */
export function unregisterMatcher(name: string): void {
  registry.delete(name);
}

/** 列出所有已注册 matcher 名称 */
export function listMatchers(): string[] {
  return Array.from(registry.keys());
}

/** 按 URL 顺序匹配，返回第一个命中的 matcher；都不命中返回 null */
export function findMatcherForUrl(rawUrl: string): LinkCardMatcher | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  // 最后注册的先试 → 允许自定义 matcher 覆盖内置
  const matchers = Array.from(registry.values()).reverse();
  for (const m of matchers) {
    try {
      if (m.match(url)) return m;
    } catch {
      // matcher.match 内部异常忽略，继续下一个
    }
  }
  return null;
}

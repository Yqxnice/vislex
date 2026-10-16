import { registerMatcher } from './registry.js';
import { githubMatcher } from './github.js';
import { leetcodeMatcher } from './leetcode.js';
import { neteaseMusicMatcher } from './netease.js';
import { qqMusicMatcher } from './qqmusic.js';

/**
 * 注册所有内置 matcher。
 * 会被 linkCardPlugin 入口调用一次，保证编辑器实例化时匹配系统已就绪。
 */
export function registerBuiltinMatchers(): void {
  registerMatcher(githubMatcher);
  registerMatcher(leetcodeMatcher);
  registerMatcher(neteaseMusicMatcher);
  registerMatcher(qqMusicMatcher);
}

export { registerMatcher, unregisterMatcher, listMatchers, findMatcherForUrl } from './registry.js';
export type { LinkCardMatcher } from './registry.js';

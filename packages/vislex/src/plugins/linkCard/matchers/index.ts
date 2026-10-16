import { registerMatcher } from './registry';
import { githubMatcher } from './github';
import { leetcodeMatcher } from './leetcode';
import { neteaseMusicMatcher } from './netease';
import { qqMusicMatcher } from './qqmusic';

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

export { registerMatcher, unregisterMatcher, listMatchers, findMatcherForUrl } from './registry';
export type { LinkCardMatcher } from './registry';

import type { LinkCardData } from '../LinkCardNode';
import type { LinkCardMatcher } from './registry';

const LEETCODE_HOSTS = /^(www\.)?leetcode\.(com|cn)$/;

/** 从 URL 提取题目 slug（英文）或 id（中文站） */
function extractProblem(url: URL): { slug?: string; id?: string; lang: 'en' | 'cn' } | null {
  const parts = url.pathname.split('/').filter(Boolean);
  // leetcode.com/problems/two-sum/
  const problemsIdx = parts.indexOf('problems');
  if (problemsIdx >= 0 && parts[problemsIdx + 1]) {
    return { slug: parts[problemsIdx + 1].replace(/-/g, ' '), lang: 'en' };
  }
  // leetcode.cn/problems/two-sum/ OR problems/两数之和/
  if (url.hostname.includes('leetcode.cn') && problemsIdx >= 0 && parts[problemsIdx + 1]) {
    return { id: parts[problemsIdx + 1], lang: 'cn' };
  }
  return null;
}

export const leetcodeMatcher: LinkCardMatcher = {
  name: 'leetcode',
  match(url: URL): boolean {
    return LEETCODE_HOSTS.test(url.hostname) && extractProblem(url) !== null;
  },
  async fetch(url: URL): Promise<LinkCardData> {
    const info = extractProblem(url);
    if (!info) {
      return { shape: 'wide', title: 'LeetCode', host: url.hostname };
    }
    const title = info.slug ?? info.id ?? 'LeetCode Problem';
    return {
      shape: 'wide',
      title,
      difficulty: 'unknown',
      tags: [] as string[],
      acceptanceRate: undefined,
      host: url.hostname,
      kind: 'leetcode',
    };
  },
};

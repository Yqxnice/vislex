import type { LinkCardData } from '../LinkCardNode';
import type { LinkCardMatcher } from './registry';

/** GitHub 统一 matcher：按 path 区分 Repo / PR / Issue / Commit / Discussion */
const GITHUB_HOST = /^(www\.)?github\.com$/;

function parseGithubPath(url: URL): { kind: string; owner: string; repo: string; rest: string[] } | null {
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const [owner, repo, ...rest] = parts;
  if (!owner || !repo) return null;
  let kind = 'repo';
  if (rest[0] === 'pull' || rest[0] === 'pulls') kind = 'pr';
  else if (rest[0] === 'issues') kind = 'issue';
  else if (rest[0] === 'commit' || rest[0] === 'commits') kind = 'commit';
  else if (rest[0] === 'discussions') kind = 'discussion';
  return { kind, owner, repo, rest };
}

/** 静态渲染器：GitHub matcher 在无 API 时返回解析后的 URL 信息作为 data */
function makeGithubData(url: URL): LinkCardData {
  const parsed = parseGithubPath(url);
  if (!parsed) {
    return { shape: 'compact', title: url.hostname };
  }
  const { kind, owner, repo, rest } = parsed;
  const repoPath = `${owner}/${repo}`;

  switch (kind) {
    case 'pr': {
      const num = rest[1] ?? '';
      return {
        shape: 'compact',
        title: `PR #${num}`,
        repository: repoPath,
        kind: 'gh-pr',
        host: 'github.com',
      };
    }
    case 'issue': {
      const num = rest[1] ?? '';
      return {
        shape: 'compact',
        title: `Issue #${num}`,
        repository: repoPath,
        kind: 'gh-issue',
        host: 'github.com',
      };
    }
    case 'commit': {
      const sha = rest[1] ?? '';
      return {
        shape: 'compact',
        title: sha ? sha.slice(0, 7) : 'Commit',
        repository: repoPath,
        kind: 'gh-commit',
        host: 'github.com',
      };
    }
    case 'discussion': {
      const num = rest[1] ?? '';
      return {
        shape: 'compact',
        title: num ? `Discussion #${num}` : 'Discussion',
        repository: repoPath,
        kind: 'gh-discussion',
        host: 'github.com',
      };
    }
    case 'repo':
    default:
      return {
        shape: 'compact',
        title: repoPath,
        kind: 'gh-repo',
        host: 'github.com',
      };
  }
}

export const githubMatcher: LinkCardMatcher = {
  name: 'github',
  match(url: URL): boolean {
    return GITHUB_HOST.test(url.hostname);
  },
  async fetch(url: URL): Promise<LinkCardData> {
    // 纯静态解析，不依赖 GitHub API（避免 token 缺失和 CORS 限制）
    return makeGithubData(url);
  },
};

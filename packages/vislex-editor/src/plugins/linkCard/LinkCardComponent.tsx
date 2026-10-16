import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { AlertTriangle, ExternalLink, Music } from 'lucide-react';
import { blockWrap } from '../../ui/classes.css';
import { $isLinkCardNode, type LinkCardData, type LinkCardShape } from './LinkCardNode.js';
import { findMatcherForUrl } from './matchers/index.js';
import * as css from './linkCard.css';

interface LinkCardComponentProps {
  nodeKey: string;
  url: string;
  shape: LinkCardShape;
  matcherName?: string;
  data?: LinkCardData;
  error?: string;
}

/** 从 URL 提取主机名 */
function getHost(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return rawUrl;
  }
}

/** 无匹配时的静态卡片：只渲染主机名 + URL */
function StaticFallbackCard({ url }: { url: string }) {
  const host = getHost(url);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={css.cardCompact}>
      <div className={css.icon}>
        <ExternalLink size={18} />
      </div>
      <div className={css.bodyCompact}>
        <span className={css.title}>{host}</span>
        <span className={css.url}>{url}</span>
      </div>
      <div className={css.arrow}>→</div>
    </a>
  );
}

/** 错误状态卡片：虚线边框 + 提示 */
function ErrorCard({ url, error }: { url: string; error?: string }) {
  const host = getHost(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={css.cardError}
    >
      <div className={css.iconError}>
        <AlertTriangle size={18} />
      </div>
      <div className={css.bodyCompact}>
        <span className={css.title}>
          {host}
          <span className={css.errorNote}> · {error ?? '无法获取预览'}</span>
        </span>
        <span className={css.url}>{url}</span>
      </div>
      <div className={css.arrow}>→</div>
    </a>
  );
}

// ---------- GitHub 渲染器 ----------

function renderGithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

function GithubRepoCard({ data, url }: { data: LinkCardData; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={css.cardCompact}
    >
      <div className={css.iconGithub}>{renderGithubIcon()}</div>
      <div className={css.bodyCompact}>
        <span className={css.kindTag}>GitHub Repo</span>
        <span className={css.title}>{data.title ?? url}</span>
        {typeof data.description === 'string' && data.description ? (
          <span className={css.desc}>{data.description}</span>
        ) : null}
      </div>
      <div className={css.arrow}>→</div>
    </a>
  );
}

function GithubPRCard({ data, url }: { data: LinkCardData; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={css.cardCompact}
    >
      <div className={css.iconGithub}>{renderGithubIcon()}</div>
      <div className={css.bodyCompact}>
        <span className={css.kindTagPr}>Pull Request</span>
        <span className={css.title}>{data.title ?? url}</span>
        <span className={css.subtitle}>
          {data.repository ? <span className={css.repo}>{data.repository}</span> : null}
          {data.diffStats ? ` · +${data.diffStats.additions}/-${data.diffStats.deletions}` : null}
        </span>
      </div>
      <div className={css.arrow}>→</div>
    </a>
  );
}

function GithubIssueCard({ data, url }: { data: LinkCardData; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={css.cardCompact}
    >
      <div className={css.iconGithub}>{renderGithubIcon()}</div>
      <div className={css.bodyCompact}>
        <span className={css.kindTagIssue}>Issue</span>
        <span className={css.title}>{data.title ?? url}</span>
        <span className={css.subtitle}>{data.repository}</span>
      </div>
      <div className={css.arrow}>→</div>
    </a>
  );
}

function GithubCommitCard({ data, url }: { data: LinkCardData; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={css.cardCompact}
    >
      <div className={css.iconGithub}>{renderGithubIcon()}</div>
      <div className={css.bodyCompact}>
        <span className={css.kindTagCommit}>Commit</span>
        <span className={css.titleMono}>{data.title ?? url}</span>
        <span className={css.subtitle}>{data.repository}</span>
      </div>
      <div className={css.arrow}>→</div>
    </a>
  );
}

function GithubDiscussionCard({ data, url }: { data: LinkCardData; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={css.cardCompact}
    >
      <div className={css.iconGithub}>{renderGithubIcon()}</div>
      <div className={css.bodyCompact}>
        <span className={css.kindTagDiscussion}>Discussion</span>
        <span className={css.title}>{data.title ?? url}</span>
        <span className={css.subtitle}>{data.repository}</span>
      </div>
      <div className={css.arrow}>→</div>
    </a>
  );
}

// ---------- LeetCode 渲染器 ----------

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
  unknown: '#9ca3af',
};

function LeetCodeCard({ data, url }: { data: LinkCardData; url: string }) {
  const difficulty = String(data.difficulty ?? 'unknown').toLowerCase();
  const color = DIFFICULTY_COLORS[difficulty] ?? DIFFICULTY_COLORS.unknown;
  const tags = Array.isArray(data.tags) ? (data.tags as string[]) : [];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={css.cardWide}
    >
      {typeof data.image === 'string' && data.image ? (
        <div className={css.thumb}>
          <img src={data.image} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className={css.bodyWide}>
        <div className={css.head}>
          <span className={css.kindTagLeetcode}>LeetCode</span>
          <span className={css.difficulty} style={{ backgroundColor: color }}>
            {difficulty.toUpperCase()}
          </span>
        </div>
        <span className={css.title}>{data.title ?? url}</span>
        {typeof data.acceptanceRate === 'number' ? (
          <span className={css.subtitle}>通过率 {data.acceptanceRate.toFixed(1)}%</span>
        ) : null}
        {tags.length > 0 ? (
          <div className={css.tags}>
            {tags.map((t) => (
              <span key={t} className={css.tagChip}>
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className={css.arrow}>→</div>
    </a>
  );
}

// ---------- 音乐渲染器 ----------

function MusicCard({ data, url }: { data: LinkCardData; url: string }) {
  const isQQ = data.kind === 'qq-song';
  const brandLabel = isQQ ? 'QQ 音乐' : '网易云音乐';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={css.cardWide}
    >
      {typeof data.image === 'string' && data.image ? (
        <div className={css.thumb}>
          <img src={data.image} alt="" loading="lazy" />
        </div>
      ) : (
        <div className={css.iconMusic}>
          <Music size={28} />
        </div>
      )}
      <div className={css.bodyWide}>
        <span className={css.kindTag}>{brandLabel}</span>
        <span className={css.title}>{data.title ?? url}</span>
        <div className={css.musicBlock}>
          {data.artist ? (
            <span className={css.musicItem}>
              <span className={css.musicLabel}>歌手</span>
              <span className={css.musicValue}>{String(data.artist)}</span>
            </span>
          ) : null}
          {data.album ? (
            <span className={css.musicItem}>
              <span className={css.musicLabel}>专辑</span>
              <span className={css.musicValue}>{String(data.album)}</span>
            </span>
          ) : null}
        </div>
      </div>
      <div className={css.arrow}>→</div>
    </a>
  );
}

// ---------- 通用 wide 渲染器 ----------

function WideDataCard({ data, url }: { data: LinkCardData; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={css.cardWide}
    >
      {typeof data.image === 'string' && data.image ? (
        <div className={css.thumb}>
          <img src={data.image} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className={css.bodyWide}>
        {data.kind ? <span className={css.kindTag}>{String(data.kind)}</span> : null}
        <span className={css.title}>{data.title ?? getHost(url)}</span>
        {data.description ? <span className={css.desc}>{data.description}</span> : null}
      </div>
      <div className={css.arrow}>→</div>
    </a>
  );
}

// ---------- 主组件 ----------

/** 匹配 kind 到专用渲染器 */
function renderDataCard({ data, url }: { data: LinkCardData; url: string }) {
  switch (data.kind) {
    case 'gh-repo':
      return <GithubRepoCard data={data} url={url} />;
    case 'gh-pr':
      return <GithubPRCard data={data} url={url} />;
    case 'gh-issue':
      return <GithubIssueCard data={data} url={url} />;
    case 'gh-commit':
      return <GithubCommitCard data={data} url={url} />;
    case 'gh-discussion':
      return <GithubDiscussionCard data={data} url={url} />;
    case 'leetcode':
      return <LeetCodeCard data={data} url={url} />;
    case 'netease-song':
    case 'qq-song':
      return <MusicCard data={data} url={url} />;
    default:
      return <WideDataCard data={data} url={url} />;
  }
}

export function LinkCardComponent({
  nodeKey,
  url,
  matcherName: _matcherName,
  data,
  error,
}: LinkCardComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [loading, setLoading] = useState(() => !data && !error);

  // 首次挂载：若无 data 无 error，先调后端 preview，失败再 fallback 前端静态解析
  useEffect(() => {
    if (data || error) return; // 已有结果（可能是之前保存的 JSON）
    let cancelled = false;
    setLoading(true);

    (async () => {
      // 1. 优先走后端 proxy（同源 /api 由 Vite 代理到 core 服务）
      try {
        const res = await fetch(
          `/api/linkcard/preview?url=${encodeURIComponent(url)}`,
          { method: 'GET', credentials: 'include' },
        );
        if (res.ok) {
          const json = (await res.json()) as { matcherName: string; data: LinkCardData };
          if (!cancelled) {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey);
              if ($isLinkCardNode(node)) {
                node.setMatcherName(json.matcherName);
                node.setData(json.data);
                if (json.data.shape) node.setShape(json.data.shape);
              }
            });
          }
          setLoading(false);
          return;
        }
      } catch {
        // 后端不可达（网络错 / 超时）— 不报错，降级到前端静态解析
      }

      // 2. 后端挂了 → 前端 matcher 静态 fallback（GitHub 等 matcher 只做 URL 解析）
      const matcher = findMatcherForUrl(url);
      if (matcher) {
        try {
          const resolved = await matcher.fetch(new URL(url));
          if (cancelled) return;
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isLinkCardNode(node)) {
              node.setMatcherName(matcher.name);
              node.setData(resolved);
              node.setShape(resolved.shape ?? node.getShape());
            }
          });
        } catch {
          // 前端 matcher 也挂 — 让 StaticFallback 兜底
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // 错误状态（已持久化或本次 fetch 失败）
  if (error) {
    return (
      <div className={blockWrap} data-node-key={nodeKey}>
        <ErrorCard url={url} error={error} />
      </div>
    );
  }

  // 有匹配数据 → 渲染专用卡片
  if (data) {
    return (
      <div className={blockWrap} data-node-key={nodeKey}>
        {renderDataCard({ data, url })}
      </div>
    );
  }

  // loading 中或无匹配 → 静态 fallback
  if (loading) {
    return (
      <div className={blockWrap} data-node-key={nodeKey}>
        <div className={css.loading}>加载中…</div>
      </div>
    );
  }

  return (
    <div className={blockWrap} data-node-key={nodeKey}>
      <StaticFallbackCard url={url} />
    </div>
  );
}

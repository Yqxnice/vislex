import type { LinkCardData, LinkCardRendererProps } from '@vislex/editor/static';

import * as card from './card.css';
import { AlertTriangleIcon, MusicIcon } from './icons.js';
import * as css from './linkCard.css';

/** 从 URL 提取主机名 */
function getHost(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return rawUrl;
  }
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
        <AlertTriangleIcon size={18} />
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
          <MusicIcon size={28} />
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

/**
 * 链接卡片静态渲染器（RendererConfig 的 LinkCard 槽位）。
 * 只画已缓存数据：不发起任何网络请求 / matcher 匹配；
 * DOM 结构与编辑器静态外观一致（blockWrap 对应 LinkCardNode createDOM）。
 */
export function LinkCardRenderer({ url, data, error }: LinkCardRendererProps) {
  // 错误状态（已持久化的 fetch 失败原因）
  if (error) {
    return (
      <div className={card.blockWrap}>
        <ErrorCard url={url} error={error} />
      </div>
    );
  }

  // 有匹配数据 → 渲染专用卡片
  if (data) {
    return (
      <div className={card.blockWrap}>
        {renderDataCard({ data, url })}
      </div>
    );
  }

  // data 未就绪：与编辑器占位外观一致（渲染端不再 fetch，保持占位）
  return (
    <div className={card.blockWrap}>
      <div className={css.loading}>加载中…</div>
    </div>
  );
}

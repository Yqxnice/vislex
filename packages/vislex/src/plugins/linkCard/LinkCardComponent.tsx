import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { AlertTriangle, ExternalLink, Music } from 'lucide-react';
import { $isLinkCardNode, type LinkCardData, type LinkCardShape } from './LinkCardNode';
import { findMatcherForUrl } from './matchers';

// ---------- 共享类名 ----------

const linkCardWrapCls = 'block my-2.5';

/** 卡片基类：group/lc 供箭头 hover 联动；compact/wide 仅差对齐与间距 */
const cardBase =
  'group/lc flex rounded-[10px] border border-vl-border bg-vl-surface px-4 py-3.5 text-vl-text no-underline transition-[border-color,box-shadow,transform] hover:border-vl-border-strong hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)]';
const cardCompactCls = cardBase + ' items-center gap-3';
const cardWideCls = cardBase + ' items-stretch gap-3.5';
const cardErrorCls =
  'group/lc flex items-center gap-3 rounded-[10px] border border-dashed border-red-500 bg-red-50 px-4 py-3.5 text-vl-text no-underline transition-[border-color,box-shadow,transform] hover:border-vl-border-strong hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:border-red-500/50 dark:bg-red-500/[0.06]';

const loadingCls =
  'rounded-[10px] border border-dashed border-vl-border bg-vl-surface-muted px-4 py-3.5 text-center text-[13px] text-vl-text-muted';

const iconCls =
  'flex size-9 flex-none items-center justify-center rounded-lg bg-vl-code-bg text-vl-text-muted';
const iconErrorCls =
  'flex size-9 flex-none items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-500/15';
const iconGithubCls =
  'flex size-9 flex-none items-center justify-center rounded-lg bg-[#24292f] text-white';
const iconMusicCls =
  'flex size-[52px] flex-none items-center justify-center rounded-[10px] bg-gradient-to-br from-neutral-100 to-neutral-200 text-vl-brand dark:from-gray-800 dark:to-gray-700';

const bodyCompactCls = 'flex min-w-0 flex-1 flex-col gap-1';
const bodyWideCls = 'flex min-w-0 flex-1 flex-col gap-1.5';

const titleCls =
  'overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap text-vl-text';
const titleMonoCls =
  'overflow-hidden font-mono text-[13px] font-semibold text-ellipsis whitespace-nowrap text-vl-text';
const urlCls = 'overflow-hidden text-xs text-ellipsis whitespace-nowrap text-vl-text-muted';
const descCls = 'line-clamp-2 text-[13px] leading-[1.5] text-vl-text-muted';
const subtitleCls = 'flex items-center gap-1.5 text-xs text-vl-text-muted';
const repoCls = 'font-mono';

const kindTagBase =
  'inline-block self-start rounded px-2 py-0.5 text-[11px] font-semibold tracking-[0.02em] uppercase';
const KIND_TAG_VARIANTS: Record<string, string> = {
  pr: 'bg-green-500/12 text-green-600 dark:bg-green-500/20 dark:text-green-400',
  issue: 'bg-orange-400/12 text-orange-600 dark:bg-orange-400/20 dark:text-orange-400',
  commit: 'bg-indigo-500/12 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
  discussion: 'bg-purple-500/12 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  leetcode: 'bg-slate-900/[0.08] text-slate-900 dark:bg-slate-200/[0.12] dark:text-slate-200',
};
const kindTagDefaultCls = 'bg-vl-code-bg text-vl-text-muted';
const kindTagPrCls = kindTagBase + ' ' + KIND_TAG_VARIANTS.pr;
const kindTagIssueCls = kindTagBase + ' ' + KIND_TAG_VARIANTS.issue;
const kindTagCommitCls = kindTagBase + ' ' + KIND_TAG_VARIANTS.commit;
const kindTagDiscussionCls = kindTagBase + ' ' + KIND_TAG_VARIANTS.discussion;
const kindTagLeetcodeCls = kindTagBase + ' ' + KIND_TAG_VARIANTS.leetcode;
const kindTagCls = kindTagBase + ' ' + kindTagDefaultCls;

const arrowCls =
  'flex-none text-base leading-none text-vl-text-muted transition-transform group-hover/lc:translate-x-0.5 group-hover/lc:text-vl-brand';

const thumbCls =
  'size-[72px] flex-none overflow-hidden rounded-lg bg-vl-code-bg [&_img]:size-full [&_img]:object-cover';

const headCls = 'flex items-center gap-2';
const difficultyCls = 'rounded px-2 py-0.5 text-[11px] font-bold tracking-[0.03em] text-white';
const tagsCls = 'flex flex-wrap gap-1';
const tagChipCls =
  'rounded border border-vl-border bg-vl-surface-muted px-1.5 py-px text-[11px] text-vl-text-muted';

const musicBlockCls = 'mt-0.5 flex gap-4';
const blockItemCls = 'flex flex-col gap-px text-xs';
const blockLabelCls = 'text-[11px] text-vl-text-muted';
const blockValueCls = 'text-vl-text';

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
    <a href={url} target="_blank" rel="noopener noreferrer" className={cardCompactCls}>
      <div className={iconCls}>
        <ExternalLink size={18} />
      </div>
      <div className={bodyCompactCls}>
        <span className={titleCls}>{host}</span>
        <span className={urlCls}>{url}</span>
      </div>
      <div className={arrowCls}>→</div>
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
      className={cardErrorCls}
    >
      <div className={iconErrorCls}>
        <AlertTriangle size={18} />
      </div>
      <div className={bodyCompactCls}>
        <span className={titleCls}>
          {host}
          <span className="font-normal text-red-500 dark:text-red-400"> · {error ?? '无法获取预览'}</span>
        </span>
        <span className={urlCls}>{url}</span>
      </div>
      <div className={arrowCls}>→</div>
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
      className={cardCompactCls}
    >
      <div className={iconGithubCls}>{renderGithubIcon()}</div>
      <div className={bodyCompactCls}>
        <span className={kindTagCls}>GitHub Repo</span>
        <span className={titleCls}>{data.title ?? url}</span>
        {typeof data.description === 'string' && data.description ? (
          <span className={descCls}>{data.description}</span>
        ) : null}
      </div>
      <div className={arrowCls}>→</div>
    </a>
  );
}

function GithubPRCard({ data, url }: { data: LinkCardData; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cardCompactCls}
    >
      <div className={iconGithubCls}>{renderGithubIcon()}</div>
      <div className={bodyCompactCls}>
        <span className={kindTagPrCls}>Pull Request</span>
        <span className={titleCls}>{data.title ?? url}</span>
        <span className={subtitleCls}>
          {data.repository ? <span className={repoCls}>{data.repository}</span> : null}
          {data.diffStats ? ` · +${data.diffStats.additions}/-${data.diffStats.deletions}` : null}
        </span>
      </div>
      <div className={arrowCls}>→</div>
    </a>
  );
}

function GithubIssueCard({ data, url }: { data: LinkCardData; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cardCompactCls}
    >
      <div className={iconGithubCls}>{renderGithubIcon()}</div>
      <div className={bodyCompactCls}>
        <span className={kindTagIssueCls}>Issue</span>
        <span className={titleCls}>{data.title ?? url}</span>
        <span className={subtitleCls}>{data.repository}</span>
      </div>
      <div className={arrowCls}>→</div>
    </a>
  );
}

function GithubCommitCard({ data, url }: { data: LinkCardData; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cardCompactCls}
    >
      <div className={iconGithubCls}>{renderGithubIcon()}</div>
      <div className={bodyCompactCls}>
        <span className={kindTagCommitCls}>Commit</span>
        <span className={titleMonoCls}>{data.title ?? url}</span>
        <span className={subtitleCls}>{data.repository}</span>
      </div>
      <div className={arrowCls}>→</div>
    </a>
  );
}

function GithubDiscussionCard({ data, url }: { data: LinkCardData; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cardCompactCls}
    >
      <div className={iconGithubCls}>{renderGithubIcon()}</div>
      <div className={bodyCompactCls}>
        <span className={kindTagDiscussionCls}>Discussion</span>
        <span className={titleCls}>{data.title ?? url}</span>
        <span className={subtitleCls}>{data.repository}</span>
      </div>
      <div className={arrowCls}>→</div>
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
      className={cardWideCls}
    >
      {typeof data.image === 'string' && data.image ? (
        <div className={thumbCls}>
          <img src={data.image} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className={bodyWideCls}>
        <div className={headCls}>
          <span className={kindTagLeetcodeCls}>LeetCode</span>
          <span className={difficultyCls} style={{ backgroundColor: color }}>
            {difficulty.toUpperCase()}
          </span>
        </div>
        <span className={titleCls}>{data.title ?? url}</span>
        {typeof data.acceptanceRate === 'number' ? (
          <span className={subtitleCls}>通过率 {data.acceptanceRate.toFixed(1)}%</span>
        ) : null}
        {tags.length > 0 ? (
          <div className={tagsCls}>
            {tags.map((t) => (
              <span key={t} className={tagChipCls}>
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className={arrowCls}>→</div>
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
      className={cardWideCls}
    >
      {typeof data.image === 'string' && data.image ? (
        <div className={thumbCls}>
          <img src={data.image} alt="" loading="lazy" />
        </div>
      ) : (
        <div className={iconMusicCls}>
          <Music size={28} />
        </div>
      )}
      <div className={bodyWideCls}>
        <span className={kindTagCls}>{brandLabel}</span>
        <span className={titleCls}>{data.title ?? url}</span>
        <div className={musicBlockCls}>
          {data.artist ? (
            <span className={blockItemCls}>
              <span className={blockLabelCls}>歌手</span>
              <span className={blockValueCls}>{String(data.artist)}</span>
            </span>
          ) : null}
          {data.album ? (
            <span className={blockItemCls}>
              <span className={blockLabelCls}>专辑</span>
              <span className={blockValueCls}>{String(data.album)}</span>
            </span>
          ) : null}
        </div>
      </div>
      <div className={arrowCls}>→</div>
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
      className={cardWideCls}
    >
      {typeof data.image === 'string' && data.image ? (
        <div className={thumbCls}>
          <img src={data.image} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className={bodyWideCls}>
        {data.kind ? <span className={kindTagCls}>{String(data.kind)}</span> : null}
        <span className={titleCls}>{data.title ?? getHost(url)}</span>
        {data.description ? <span className={descCls}>{data.description}</span> : null}
      </div>
      <div className={arrowCls}>→</div>
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
      <div className={linkCardWrapCls} data-node-key={nodeKey}>
        <ErrorCard url={url} error={error} />
      </div>
    );
  }

  // 有匹配数据 → 渲染专用卡片
  if (data) {
    return (
      <div className={linkCardWrapCls} data-node-key={nodeKey}>
        {renderDataCard({ data, url })}
      </div>
    );
  }

  // loading 中或无匹配 → 静态 fallback
  if (loading) {
    return (
      <div className={linkCardWrapCls} data-node-key={nodeKey}>
        <div className={loadingCls}>加载中…</div>
      </div>
    );
  }

  return (
    <div className={linkCardWrapCls} data-node-key={nodeKey}>
      <StaticFallbackCard url={url} />
    </div>
  );
}

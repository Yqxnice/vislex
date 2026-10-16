import type { LinkCardData } from '../LinkCardNode';
import type { LinkCardMatcher } from './registry';

/**
 * 网易云音乐：music.163.com
 * - /#/song?id=XXX 或 /song?id=XXX （SPA hash 路由）
 */
const NETEASE_HOST = /^music\.163\.com$/;

function extractSongId(url: URL): string | null {
  // SPA hash 路由：/#/song?id=440121
  if (url.hash.startsWith('#/')) {
    const hashUrl = new URL(url.hash.slice(2), url.origin);
    const id = hashUrl.searchParams.get('id');
    if (id) return id;
  }
  // 标准路径：/song?id=440121
  const id = url.searchParams.get('id');
  if (id && url.pathname.split('/').includes('song')) return id;
  return null;
}

export const neteaseMusicMatcher: LinkCardMatcher = {
  name: 'netease-music',
  match(url: URL): boolean {
    return NETEASE_HOST.test(url.hostname) && extractSongId(url) !== null;
  },
  async fetch(url: URL): Promise<LinkCardData> {
    const id = extractSongId(url) ?? '';
    return {
      shape: 'wide',
      title: `网易云音乐 · 歌曲 ${id}`,
      artist: '',
      album: '',
      host: url.hostname,
      kind: 'netease-song',
    };
  },
};

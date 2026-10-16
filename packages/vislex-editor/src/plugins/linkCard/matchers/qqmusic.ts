import type { LinkCardData } from '../LinkCardNode.js';
import type { LinkCardMatcher } from './registry.js';

/**
 * QQ 音乐：y.qq.com
 * - /n/ryqq/songDetail/XXX 或 /song/XXX （新版）
 * - /song/101982 或旧路径
 */
const QQ_MUSIC_HOST = /^y\.qq\.com$/;

export const qqMusicMatcher: LinkCardMatcher = {
  name: 'qq-music',
  match(url: URL): boolean {
    if (!QQ_MUSIC_HOST.test(url.hostname)) return false;
    const parts = url.pathname.split('/').filter(Boolean);
    return parts.includes('songDetail') || parts.includes('song');
  },
  async fetch(url: URL): Promise<LinkCardData> {
    const parts = url.pathname.split('/').filter(Boolean);
    let id = '';
    const detailIdx = parts.indexOf('songDetail');
    if (detailIdx >= 0 && parts[detailIdx + 1]) id = parts[detailIdx + 1];
    const songIdx = parts.indexOf('song');
    if (!id && songIdx >= 0 && parts[songIdx + 1]) id = parts[songIdx + 1];

    return {
      shape: 'wide',
      title: id ? `QQ 音乐 · 歌曲 ${id}` : 'QQ 音乐',
      artist: '',
      album: '',
      host: url.hostname,
      kind: 'qq-song',
    };
  },
};

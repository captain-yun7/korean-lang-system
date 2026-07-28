const YOUTUBE_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
];

const VIDEO_ID_PATTERN = /^[\w-]{11}$/;

export interface YoutubeVideo {
  videoId: string;
  startSeconds?: number;
}

// "1h2m3s" / "90" 형태의 유튜브 t 파라미터를 초 단위로 변환
function parseStartSeconds(value: string | null): number | undefined {
  if (!value) return undefined;

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const matched = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!matched || !matched[0]) return undefined;

  const [, hours, minutes, seconds] = matched;
  const total =
    Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0);

  return total > 0 ? total : undefined;
}

export function parseYoutubeUrl(text: string): YoutubeVideo | null {
  const trimmed = text.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (!YOUTUBE_HOSTS.includes(url.hostname.toLowerCase())) return null;

  const segments = url.pathname.split('/').filter(Boolean);
  let videoId: string | undefined;

  if (url.hostname.toLowerCase().endsWith('youtu.be')) {
    videoId = segments[0];
  } else if (segments[0] === 'watch') {
    videoId = url.searchParams.get('v') || undefined;
  } else if (segments[0] === 'shorts' || segments[0] === 'embed' || segments[0] === 'live') {
    videoId = segments[1];
  }

  if (!videoId || !VIDEO_ID_PATTERN.test(videoId)) return null;

  return {
    videoId,
    startSeconds: parseStartSeconds(url.searchParams.get('t')),
  };
}

export function isYoutubeUrl(text: string): boolean {
  return parseYoutubeUrl(text) !== null;
}

export function buildYoutubeEmbedUrl({ videoId, startSeconds }: YoutubeVideo): string {
  const params = new URLSearchParams({ rel: '0', modestbranding: '1' });
  if (startSeconds) {
    params.set('start', String(startSeconds));
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

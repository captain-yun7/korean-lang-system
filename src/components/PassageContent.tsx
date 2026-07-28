import { buildYoutubeEmbedUrl, parseYoutubeUrl, type YoutubeVideo } from '@/lib/youtube';

interface PassageContentProps {
  text: string;
  className?: string;
}

type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'video'; video: YoutubeVideo };

// 한 줄 전체가 유튜브 주소인 경우에만 영상으로 처리한다
function splitSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let buffer: string[] = [];

  const flush = () => {
    const value = buffer.join('\n').trim();
    if (value) {
      segments.push({ kind: 'text', value });
    }
    buffer = [];
  };

  for (const line of text.split('\n')) {
    const video = parseYoutubeUrl(line);
    if (video) {
      flush();
      segments.push({ kind: 'video', video });
    } else {
      buffer.push(line);
    }
  }
  flush();

  return segments;
}

export default function PassageContent({ text, className = '' }: PassageContentProps) {
  const segments = splitSegments(text);

  if (segments.length === 1 && segments[0].kind === 'text') {
    return <div className={`whitespace-pre-wrap ${className}`}>{segments[0].value}</div>;
  }

  return (
    <div className="space-y-3">
      {segments.map((segment, index) =>
        segment.kind === 'video' ? (
          <div key={index} className="relative w-full aspect-video overflow-hidden rounded-lg bg-black">
            <iframe
              src={buildYoutubeEmbedUrl(segment.video)}
              title="지문 영상"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div key={index} className={`whitespace-pre-wrap ${className}`}>
            {segment.value}
          </div>
        )
      )}
    </div>
  );
}

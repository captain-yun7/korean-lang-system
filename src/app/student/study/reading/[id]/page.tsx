'use client';

import { useState, useEffect, use } from 'react';
import { Card } from '@/components/ui';
import { useRouter } from 'next/navigation';

interface ContentBlock {
  para: string;
  q: string;
  a: string;
  explanation: string;
}

interface Passage {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  difficulty: string;
  contentBlocks: ContentBlock[];
}

export default function ReadingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    fetchPassage();
  }, [id]);

  // 타이머 시작
  useEffect(() => {
    if (passage && startTime === 0) {
      setStartTime(Date.now());
    }

    if (startTime > 0) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [passage, startTime]);

  const fetchPassage = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/passages/${id}`);
      if (!res.ok) throw new Error('Failed to fetch passage');

      const data = await res.json();
      setPassage(data.passage);
    } catch (error) {
      console.error('Error:', error);
      alert('지문을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    // 독해 시간을 저장하고 문단별 질문 페이지로 이동
    sessionStorage.setItem('readingTime', elapsedTime.toString());
    sessionStorage.setItem('passageId', id);
    router.push(`/student/study/paragraphs/${id}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">지문을 불러오는 중...</p>
      </div>
    );
  }

  if (!passage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">지문을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 상단 헤더 + 타이머 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{passage.title}</h1>
            <p className="text-gray-600 mt-1">
              {passage.category} · {passage.subcategory} · {passage.difficulty}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">독해 시간</p>
            <p className="text-3xl font-bold text-indigo-600">
              {formatTime(elapsedTime)}
            </p>
          </div>
        </div>
      </div>

      {/* 안내 메시지 */}
      <Card>
        <Card.Body className="p-4 bg-blue-50 border-l-4 border-blue-600">
          <p className="text-sm text-blue-900">
            📖 지문을 천천히 읽고 내용을 이해하세요. 독해를 완료한 후 "독해 완료" 버튼을 누르면 문단별 질문이 시작됩니다.
          </p>
        </Card.Body>
      </Card>

      {/* 지문 내용 */}
      <Card>
        <Card.Body className="p-8">
          <div className="prose prose-lg max-w-none">
            {passage.contentBlocks.map((block, index) => (
              <div key={index} className="mb-8 last:mb-0">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {block.para}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* 독해 완료 버튼 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 pb-6">
        <button
          onClick={handleComplete}
          className="w-full px-6 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          독해 완료 - 문단별 질문으로 이동
        </button>
      </div>
    </div>
  );
}

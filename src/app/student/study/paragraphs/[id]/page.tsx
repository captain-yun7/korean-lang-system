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

export default function ParagraphQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    fetchPassage();
  }, [id]);

  const fetchPassage = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/passages/${id}`);
      if (!res.ok) throw new Error('Failed to fetch passage');

      const data = await res.json();
      setPassage(data.passage);
      setAnswers(new Array(data.passage.contentBlocks.length).fill(''));
    } catch (error) {
      console.error('Error:', error);
      alert('지문을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentParagraph] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!answers[currentParagraph]?.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }

    if (currentParagraph < (passage?.contentBlocks.length || 0) - 1) {
      setCurrentParagraph(currentParagraph + 1);
    } else {
      // 마지막 문단 완료 - 문제 풀이로 이동
      sessionStorage.setItem('paragraphAnswers', JSON.stringify(answers));
      router.push(`/student/study/questions/${id}`);
    }
  };

  const handlePrevious = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(currentParagraph - 1);
    }
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

  const currentBlock = passage.contentBlocks[currentParagraph];
  const progress = ((currentParagraph + 1) / passage.contentBlocks.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 상단 헤더 + 진행률 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-4">
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-gray-900">{passage.title}</h1>
          <p className="text-gray-600 mt-1">문단별 질문 답하기</p>
        </div>

        {/* 진행률 바 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              문단 {currentParagraph + 1} / {passage.contentBlocks.length}
            </span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 안내 메시지 */}
      <Card>
        <Card.Body className="p-4 bg-blue-50 border-l-4 border-blue-600">
          <p className="text-sm text-blue-900">
            💡 각 문단을 읽고 질문에 답하세요. 문단 내용을 다시 확인하며 답변할 수 있습니다.
          </p>
        </Card.Body>
      </Card>

      {/* 현재 문단 */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            문단 {currentParagraph + 1}
          </h2>
        </Card.Header>
        <Card.Body className="p-6">
          <div className="prose max-w-none">
            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap mb-6">
              {currentBlock.para}
            </p>
          </div>
        </Card.Body>
      </Card>

      {/* 질문 및 답변 */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">질문</h3>
        </Card.Header>
        <Card.Body className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {currentBlock.q}
              </label>
              <textarea
                value={answers[currentParagraph] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                rows={4}
                placeholder="답변을 입력하세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 답변 상태 표시 */}
            <div className="flex items-center gap-2 text-sm">
              {answers.map((answer, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    idx === currentParagraph
                      ? 'bg-indigo-600 text-white'
                      : answer.trim()
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* 네비게이션 버튼 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 pb-6">
        <div className="flex gap-3">
          {currentParagraph > 0 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              ← 이전 문단
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            {currentParagraph < passage.contentBlocks.length - 1
              ? '다음 문단 →'
              : '문제 풀이로 이동 →'}
          </button>
        </div>
      </div>
    </div>
  );
}

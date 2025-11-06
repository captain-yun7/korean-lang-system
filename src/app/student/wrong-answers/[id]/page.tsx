'use client';

import { useState, useEffect, use } from 'react';
import { Card } from '@/components/ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WrongAnswer {
  id: string;
  studentAnswer: string[];
  correctAnswer: string[];
  questionText: string;
  questionType: string;
  explanation: string | null;
  category: string;
  isReviewed: boolean;
  createdAt: string;
  examResult: {
    exam: {
      id: string;
      title: string;
      category: string;
    };
  };
}

export default function WrongAnswerReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [wrongAnswer, setWrongAnswer] = useState<WrongAnswer | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    fetchWrongAnswer();
  }, [id]);

  const fetchWrongAnswer = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/wrong-answers/${id}`);
      if (!res.ok) throw new Error('Failed to fetch wrong answer');

      const data = await res.json();
      setWrongAnswer(data.wrongAnswer);
    } catch (error) {
      console.error('Error:', error);
      alert('오답을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSimilarity = (answer: string, correctAnswer: string): number => {
    const a = answer.toLowerCase().trim();
    const c = correctAnswer.toLowerCase().trim();

    if (a === c) return 1.0;
    if (a.includes(c) || c.includes(a)) return 0.7;

    const aWords = a.split(/\s+/);
    const cWords = c.split(/\s+/);
    const matchCount = aWords.filter((word) => cWords.includes(word)).length;

    if (matchCount > 0) {
      return matchCount / Math.max(aWords.length, cWords.length);
    }

    return 0;
  };

  const handleSubmit = async () => {
    if (!studentAnswer.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }

    if (!wrongAnswer) return;

    let correct = false;

    // 채점
    if (wrongAnswer.questionType === '객관식') {
      correct = studentAnswer === wrongAnswer.correctAnswer[0];
    } else if (wrongAnswer.questionType === '단답형') {
      correct = wrongAnswer.correctAnswer.some(
        (ans) => calculateSimilarity(studentAnswer, ans) >= 0.9
      );
    } else if (wrongAnswer.questionType === '서술형') {
      const similarity = Math.max(
        ...wrongAnswer.correctAnswer.map((ans) =>
          calculateSimilarity(studentAnswer, ans)
        )
      );
      correct = similarity >= 0.7;
    }

    setIsCorrect(correct);
    setSubmitted(true);

    // 복습 완료 처리
    try {
      await fetch(`/api/student/wrong-answers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnswer,
          isCorrect: correct,
        }),
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRetry = () => {
    setStudentAnswer('');
    setSubmitted(false);
    setIsCorrect(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">오답을 불러오는 중...</p>
      </div>
    );
  }

  if (!wrongAnswer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">오답을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-20 pb-16 mt-8">
      {/* Header */}
      <div className="relative rounded-lg bg-white p-8 border-2 border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">오답 복습</h1>
          <p className="text-gray-600 text-lg mt-2">다시 한 번 도전해보세요!</p>
        </div>
        <Link
          href="/student/wrong-answers"
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-bold border-2 border-gray-900"
        >
          목록으로
        </Link>
      </div>

      {/* 시험지 정보 */}
      <Card>
        <Card.Body className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {wrongAnswer.examResult.exam.title}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded font-medium">
                  {wrongAnswer.category}
                </span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* 문제 */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              문제 ({wrongAnswer.questionType})
            </h2>
            {wrongAnswer.isReviewed && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                복습 완료
              </span>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-6">
          <p className="text-gray-900 text-lg mb-6">
            {wrongAnswer.questionText}
          </p>

          {/* 답변 입력 */}
          {!submitted && (
            <div className="space-y-4">
              {wrongAnswer.questionType === '서술형' ? (
                <textarea
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  rows={6}
                  placeholder="답을 작성하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              ) : (
                <input
                  type="text"
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="답을 입력하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              )}

              <button
                onClick={handleSubmit}
                className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium border-2 border-gray-900"
              >
                제출하기
              </button>
            </div>
          )}

          {/* 결과 */}
          {submitted && (
            <div className="space-y-6">
              {/* 결과 표시 */}
              <div className="p-6 rounded-lg border-2 border-gray-900 bg-white">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-6xl">{isCorrect ? '🎉' : '😔'}</div>
                </div>
                <p className="text-center text-xl font-bold text-gray-900">
                  {isCorrect ? '정답입니다!' : '오답입니다.'}
                </p>
                <p className="text-center text-gray-600 mt-2">
                  {isCorrect
                    ? '훌륭합니다! 이제 이 문제를 완전히 이해했습니다.'
                    : '다시 한 번 도전해보세요. 포기하지 마세요!'}
                </p>
              </div>

              {/* 내 답변 */}
              <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                <p className="text-sm font-bold text-gray-900 mb-2">내 답변</p>
                <p className="text-gray-700">{studentAnswer}</p>
              </div>

              {/* 이전 오답 */}
              <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                <p className="text-sm font-bold text-gray-900 mb-2">
                  원래 내 답변 (틀렸던 답)
                </p>
                <p className="text-gray-700">{wrongAnswer.studentAnswer.join(', ')}</p>
              </div>

              {/* 정답 */}
              <div className="p-4 bg-white rounded-lg border-2 border-gray-900">
                <p className="text-sm font-bold text-gray-900 mb-2">정답</p>
                <p className="text-gray-700">{wrongAnswer.correctAnswer.join(', ')}</p>
              </div>

              {/* 해설 */}
              {wrongAnswer.explanation && (
                <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                  <p className="text-sm font-bold text-gray-900 mb-2">해설</p>
                  <p className="text-gray-700">{wrongAnswer.explanation}</p>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-4">
                {!isCorrect && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium border-2 border-gray-900"
                  >
                    다시 풀기
                  </button>
                )}
                <button
                  onClick={() => router.push('/student/wrong-answers')}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  목록으로
                </button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

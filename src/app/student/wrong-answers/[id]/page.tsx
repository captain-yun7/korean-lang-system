'use client';

import { useState, useEffect, use } from 'react';
import { Card } from '@/components/ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WrongAnswer {
  id: string;
  wrongAnswer: string;
  correctAnswer: string;
  explanation: string | null;
  isReviewed: boolean;
  createdAt: string;
  question: {
    id: string;
    content: string;
    type: string;
    options: string[] | null;
    answers: string[];
    explanation: string | null;
    passage: {
      id: string;
      title: string;
      category: string;
      subcategory: string;
      difficulty: string;
    } | null;
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
    if (wrongAnswer.question.type === '객관식') {
      correct = studentAnswer === wrongAnswer.question.answers[0];
    } else if (wrongAnswer.question.type === '단답형') {
      correct = wrongAnswer.question.answers.some(
        (ans) => calculateSimilarity(studentAnswer, ans) >= 0.9
      );
    } else if (wrongAnswer.question.type === '서술형') {
      const similarity = Math.max(
        ...wrongAnswer.question.answers.map((ans) =>
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">오답 복습</h1>
          <p className="text-gray-600 mt-1">다시 한 번 도전해보세요!</p>
        </div>
        <Link
          href="/student/wrong-answers"
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          목록으로
        </Link>
      </div>

      {/* 지문 정보 */}
      {wrongAnswer.question.passage && (
        <Card>
          <Card.Body className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href={`/student/study/reading/${wrongAnswer.question.passage.id}`}
                  className="text-lg font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {wrongAnswer.question.passage.title}
                </Link>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                    {wrongAnswer.question.passage.category}
                  </span>
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                    {wrongAnswer.question.passage.subcategory}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {wrongAnswer.question.passage.difficulty}
                  </span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* 문제 */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              문제 ({wrongAnswer.question.type})
            </h2>
            {wrongAnswer.isReviewed && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                복습 완료
              </span>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-6">
          <p className="text-gray-900 text-lg mb-6">
            {wrongAnswer.question.content}
          </p>

          {/* 답변 입력 */}
          {!submitted && (
            <div className="space-y-4">
              {wrongAnswer.question.type === '객관식' &&
                wrongAnswer.question.options && (
                  <div className="space-y-2">
                    {wrongAnswer.question.options.map((option, idx) => (
                      <label
                        key={idx}
                        className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          checked={studentAnswer === option}
                          onChange={(e) => setStudentAnswer(e.target.value)}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <span className="ml-3 text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

              {wrongAnswer.question.type === '단답형' && (
                <input
                  type="text"
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="답을 입력하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              )}

              {wrongAnswer.question.type === '서술형' && (
                <textarea
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  rows={6}
                  placeholder="답을 작성하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              )}

              <button
                onClick={handleSubmit}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                제출하기
              </button>
            </div>
          )}

          {/* 결과 */}
          {submitted && (
            <div className="space-y-6">
              {/* 결과 표시 */}
              <div
                className={`p-6 rounded-lg border-2 ${
                  isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="text-6xl">{isCorrect ? '🎉' : '😔'}</div>
                </div>
                <p
                  className={`text-center text-xl font-bold ${
                    isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {isCorrect ? '정답입니다!' : '오답입니다.'}
                </p>
                <p className="text-center text-gray-600 mt-2">
                  {isCorrect
                    ? '훌륭합니다! 이제 이 문제를 완전히 이해했습니다.'
                    : '다시 한 번 도전해보세요. 포기하지 마세요!'}
                </p>
              </div>

              {/* 내 답변 */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">내 답변</p>
                <p className="text-gray-900">{studentAnswer}</p>
              </div>

              {/* 이전 오답 */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-700 mb-2">
                  이전 오답 ({new Date(wrongAnswer.createdAt).toLocaleDateString('ko-KR')})
                </p>
                <p className="text-gray-900">{wrongAnswer.wrongAnswer}</p>
              </div>

              {/* 정답 */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-700 mb-2">정답</p>
                <p className="text-gray-900">{wrongAnswer.correctAnswer}</p>
              </div>

              {/* 해설 */}
              {wrongAnswer.explanation && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-700 mb-2">해설</p>
                  <p className="text-gray-900">{wrongAnswer.explanation}</p>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-4">
                {!isCorrect && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
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

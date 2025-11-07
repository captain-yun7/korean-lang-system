'use client';

import { useState, useEffect, use } from 'react';
import { Card } from '@/components/ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[] | null;
  answers: string[];
  explanation: string | null;
  wrongAnswerExplanations: any;
}

export default function GrammarQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/grammar/questions/${id}`);
      if (!res.ok) throw new Error('Failed to fetch question');

      const data = await res.json();
      setQuestion(data.question);
    } catch (error) {
      console.error('Error:', error);
      alert('문제를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`/api/student/grammar/questions/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });

      if (!res.ok) throw new Error('Failed to submit answer');

      const data = await res.json();
      setResult(data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
      alert('채점에 실패했습니다.');
    }
  };

  const handleRetry = () => {
    setAnswer('');
    setSubmitted(false);
    setResult(null);
  };

  const handleNext = () => {
    router.push('/student/study/grammar');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">문제를 불러오는 중...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">문제를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">문법 문제 풀이</h1>
          <p className="text-gray-600 mt-1">정답을 입력하고 즉시 채점받으세요</p>
        </div>
        <Link
          href="/student/study/grammar"
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          목록으로
        </Link>
      </div>

      {/* 문제 */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              문제 ({question.type})
            </h2>
            {submitted && (
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  result?.isCorrect
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {result?.isCorrect ? '정답' : '오답'}
              </span>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-6">
          <p className="text-gray-900 text-lg mb-6">{question.text}</p>

          {!submitted ? (
            <div className="space-y-4">
              {/* 객관식/OX */}
              {(question.type === '객관식' || question.type === 'OX') && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={answer === option}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-3 text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* 단답형 */}
              {question.type === '단답형' && (
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="답을 입력하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              )}

              {/* 서술형 */}
              {question.type === '서술형' && (
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
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
          ) : (
            <div className="space-y-6">
              {/* 결과 */}
              <div
                className={`p-6 rounded-lg border-2 ${
                  result.isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="text-6xl">{result.isCorrect ? '🎉' : '😔'}</div>
                </div>
                <p
                  className={`text-center text-xl font-bold ${
                    result.isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {result.isCorrect ? '정답입니다!' : '오답입니다.'}
                </p>
                <p className="text-center text-gray-600 mt-2">
                  {result.isCorrect
                    ? '훌륭합니다! 다음 문제로 넘어가세요.'
                    : '다시 한 번 도전해보세요!'}
                </p>
              </div>

              {/* 내 답변 */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">내 답변</p>
                <p className="text-gray-900">{answer}</p>
              </div>

              {/* 정답 */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-700 mb-2">정답</p>
                <p className="text-gray-900">
                  {Array.isArray(result.correctAnswer)
                    ? result.correctAnswer.join(' / ')
                    : result.correctAnswer}
                </p>
              </div>

              {/* 해설 */}
              {result.explanation && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-700 mb-2">해설</p>
                  <p className="text-gray-900">{result.explanation}</p>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-4">
                {!result.isCorrect && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    다시 풀기
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  다음 문제
                </button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

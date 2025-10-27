'use client';

import { useState, useEffect, use } from 'react';
import { Card } from '@/components/ui';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  type: string;
  text: string;
  options: string[] | null;
  answers: string[];
  explanation: string | null;
  wrongAnswerExplanations: Record<string, string> | null;
}

interface Passage {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  difficulty: string;
  contentBlocks: any[];
  questions: Question[];
}

export default function QuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

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

      // 답변 초기화
      const initialAnswers: Record<string, string | string[]> = {};
      data.passage.questions.forEach((q: Question) => {
        if (q.type === '객관식') {
          initialAnswers[q.id] = '';
        } else {
          initialAnswers[q.id] = '';
        }
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error:', error);
      alert('지문을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleSubmit = async () => {
    // 모든 문제에 답변했는지 확인
    const unanswered = passage?.questions.filter((q) => {
      const answer = answers[q.id];
      return !answer || (typeof answer === 'string' && !answer.trim());
    });

    if (unanswered && unanswered.length > 0) {
      if (!confirm(`${unanswered.length}개의 문제가 미답변 상태입니다. 제출하시겠습니까?`)) {
        return;
      }
    }

    setSubmitting(true);

    try {
      // sessionStorage에서 독해 시간과 문단 답변 가져오기
      const readingTime = parseInt(sessionStorage.getItem('readingTime') || '0');
      const paragraphAnswers = JSON.parse(
        sessionStorage.getItem('paragraphAnswers') || '[]'
      );

      // 결과 제출
      const res = await fetch('/api/student/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passageId: id,
          readingTime,
          paragraphAnswers,
          questionAnswers: answers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '제출에 실패했습니다.');
      }

      const data = await res.json();

      // sessionStorage 정리
      sessionStorage.removeItem('readingTime');
      sessionStorage.removeItem('paragraphAnswers');
      sessionStorage.removeItem('passageId');

      // 결과 페이지로 이동
      router.push(`/student/study/result/${data.resultId}`);
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || '제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">문제를 불러오는 중...</p>
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

  if (passage.questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <Card.Body className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900">
              이 지문에는 문제가 없습니다
            </h3>
            <p className="text-gray-600 mt-2 mb-6">
              문단별 질문만 완료되었습니다. 제출하시겠습니까?
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-indigo-400"
            >
              {submitting ? '제출 중...' : '제출하기'}
            </button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter((a) =>
    typeof a === 'string' ? a.trim() : a && a.length > 0
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 상단 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{passage.title}</h1>
          <p className="text-gray-600 mt-1">
            문제 풀이 ({answeredCount} / {passage.questions.length})
          </p>
        </div>
      </div>

      {/* 안내 메시지 */}
      <Card>
        <Card.Body className="p-4 bg-blue-50 border-l-4 border-blue-600">
          <p className="text-sm text-blue-900">
            📝 지문과 관련된 문제를 풀어보세요. 모든 문제를 완료한 후 제출하면 즉시 채점 결과를 확인할 수 있습니다.
          </p>
        </Card.Body>
      </Card>

      {/* 문제 목록 */}
      {passage.questions.map((question, index) => (
        <Card key={question.id}>
          <Card.Header className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </span>
              <div className="flex-1">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                  {question.type}
                </span>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-6">
            <div className="space-y-4">
              {/* 문제 */}
              <div>
                <p className="text-gray-900 font-medium mb-4">{question.text}</p>
              </div>

              {/* 답변 입력 - 객관식 */}
              {question.type === '객관식' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* 답변 입력 - 단답형 */}
              {question.type === '단답형' && (
                <div>
                  <input
                    type="text"
                    value={(answers[question.id] as string) || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="답을 입력하세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              {/* 답변 입력 - 서술형 */}
              {question.type === '서술형' && (
                <div>
                  <textarea
                    value={(answers[question.id] as string) || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    rows={4}
                    placeholder="답을 작성하세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      ))}

      {/* 제출 버튼 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 pb-6">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full px-6 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {submitting ? '제출 중...' : '제출하고 결과 확인하기'}
        </button>
      </div>
    </div>
  );
}

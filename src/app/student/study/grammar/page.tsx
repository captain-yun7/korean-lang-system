'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  text: string;
  type: string;
  createdAt: string;
}

export default function GrammarStudyPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/grammar/questions');
      if (!res.ok) throw new Error('Failed to fetch questions');

      const data = await res.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error:', error);
      alert('문법 문제를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRandomSelect = () => {
    if (questions.length === 0) {
      alert('선택 가능한 문제가 없습니다.');
      return;
    }
    const randomIndex = Math.floor(Math.random() * questions.length);
    const randomQuestion = questions[randomIndex];
    router.push(`/student/study/grammar/${randomQuestion.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">문법 학습</h1>
          <p className="text-gray-600 mt-1">문법/개념 문제를 풀어보세요</p>
        </div>
        <Link
          href="/student/study"
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← 뒤로가기
        </Link>
      </div>

      {/* 랜덤 선택 */}
      <Card>
        <Card.Body className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">랜덤 문제 풀기</h2>
              <p className="text-sm text-gray-600 mt-1">
                랜덤으로 선택된 문법 문제를 풀어보세요
              </p>
            </div>
            <button
              onClick={handleRandomSelect}
              disabled={questions.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              🎲 랜덤 선택
            </button>
          </div>
        </Card.Body>
      </Card>

      {/* 문제 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">문제를 불러오는 중...</p>
        </div>
      ) : questions.length === 0 ? (
        <Card>
          <Card.Body className="p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-lg font-semibold text-gray-900">
              문법 문제가 없습니다
            </h3>
            <p className="text-gray-600 mt-2">
              교사가 문법 문제를 등록하면 여기에 표시됩니다.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              전체 문제 ({questions.length}개)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.map((question, index) => (
              <Link key={question.id} href={`/student/study/grammar/${question.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <Card.Body className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl font-bold text-indigo-600">
                        #{index + 1}
                      </span>
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                        {question.type}
                      </span>
                    </div>
                    <p className="text-gray-900 line-clamp-3">{question.text}</p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        등록일:{' '}
                        {new Date(question.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DocumentTextIcon,
  SparklesIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';

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
    <div className="space-y-20 pb-16 mt-8">
      {/* Page Header */}
      <div className="relative rounded-lg bg-white p-8 border-2 border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">문법 학습</h1>
          <p className="text-gray-600 text-lg mt-2">문법/개념 문제를 풀어보세요</p>
        </div>
        <Link
          href="/student/study"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-all border-2 border-gray-900"
        >
          <ArrowLeftIcon className="w-5 h-5" /> 뒤로가기
        </Link>
      </div>

      {/* 랜덤 선택 */}
      <div className="relative group mt-20">
        <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
        <div className="relative bg-white rounded-lg p-6 m-1 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-10 h-10 text-purple-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  랜덤 문제 풀기
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  랜덤으로 선택된 문법 문제를 풀어보세요
                </p>
              </div>
            </div>
            <button
              onClick={handleRandomSelect}
              disabled={questions.length === 0}
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-gray-900"
            >
              <SparklesIcon className="w-5 h-5" /> 랜덤 선택
            </button>
          </div>
        </div>
      </div>

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
          <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              전체 문제 <span className="text-purple-500">({questions.length}개)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((question, index) => (
                <Link key={question.id} href={`/student/study/grammar/${question.id}`}>
                  <div className="relative group h-full">
                    <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
                    <div className="relative bg-white rounded-lg p-6 m-1 h-full flex flex-col border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl font-bold text-purple-500">
                          #{index + 1}
                        </span>
                        <span className="px-3 py-1 text-xs font-bold bg-purple-500 text-white rounded-full">
                          {question.type}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium line-clamp-3 flex-1">{question.text}</p>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          등록일: {new Date(question.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

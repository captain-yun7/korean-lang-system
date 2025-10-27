'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
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
    passage: {
      id: string;
      title: string;
      category: string;
      subcategory: string;
      difficulty: string;
    } | null;
  };
}

interface Stats {
  totalWrong: number;
  reviewedCount: number;
  unreviewedCount: number;
  frequentCategories: Array<{ category: string; count: number }>;
  categoryStats: { [key: string]: number };
}

export default function WrongAnswersPage() {
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedReviewStatus, setSelectedReviewStatus] = useState('');

  useEffect(() => {
    fetchWrongAnswers();
  }, [selectedCategory, selectedReviewStatus]);

  const fetchWrongAnswers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedReviewStatus) params.append('isReviewed', selectedReviewStatus);

      const res = await fetch(`/api/student/wrong-answers?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch wrong answers');

      const data = await res.json();
      setWrongAnswers(data.wrongAnswers);
      setStats(data.stats);
    } catch (error) {
      console.error('Error:', error);
      alert('오답 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">오답을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">오답 노트</h1>
        <p className="text-gray-600 mt-1">틀린 문제를 다시 풀어보고 복습하세요</p>
      </div>

      {/* 통계 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">전체 오답</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.totalWrong}개
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">복습 완료</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.reviewedCount}개
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">복습 필요</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {stats.unreviewedCount}개
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">복습률</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {stats.totalWrong > 0
                    ? Math.round((stats.reviewedCount / stats.totalWrong) * 100)
                    : 0}
                  %
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* 자주 틀리는 카테고리 */}
      {stats && stats.frequentCategories.length > 0 && (
        <Card>
          <Card.Header className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              자주 틀리는 카테고리
            </h2>
          </Card.Header>
          <Card.Body className="p-6">
            <div className="flex gap-4">
              {stats.frequentCategories.map((cat, index) => (
                <div
                  key={index}
                  className="flex-1 p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <p className="text-sm text-gray-600 mb-1">{index + 1}위</p>
                  <p className="text-xl font-bold text-red-700">{cat.category}</p>
                  <p className="text-sm text-gray-600 mt-1">{cat.count}개 문제</p>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* 필터 */}
      <Card>
        <Card.Body className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">카테고리:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">전체</option>
              <option value="비문학">비문학</option>
              <option value="문학">문학</option>
              <option value="문법">문법</option>
            </select>

            <label className="text-sm font-medium text-gray-700">복습 상태:</label>
            <select
              value={selectedReviewStatus}
              onChange={(e) => setSelectedReviewStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">전체</option>
              <option value="false">복습 필요</option>
              <option value="true">복습 완료</option>
            </select>
          </div>
        </Card.Body>
      </Card>

      {/* 오답 목록 */}
      {wrongAnswers.length === 0 ? (
        <Card>
          <Card.Body className="p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-gray-900">
              오답이 없습니다
            </h3>
            <p className="text-gray-600 mt-2">
              훌륭합니다! 모든 문제를 맞혔거나 아직 학습을 시작하지 않았습니다.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-4">
          {wrongAnswers.map((wrongAnswer) => (
            <Card key={wrongAnswer.id}>
              <Card.Body className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 지문 정보 */}
                    {wrongAnswer.question.passage && (
                      <div className="mb-3">
                        <Link
                          href={`/student/study/reading/${wrongAnswer.question.passage.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          {wrongAnswer.question.passage.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                            {wrongAnswer.question.passage.category}
                          </span>
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                            {wrongAnswer.question.passage.subcategory}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {wrongAnswer.question.passage.difficulty}
                          </span>
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
                            {wrongAnswer.question.type}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 문제 */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">문제</p>
                      <p className="text-gray-900">{wrongAnswer.question.content}</p>
                    </div>

                    {/* 내 답변 (틀린 답) */}
                    <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-medium text-red-700 mb-1">
                        내 답변 (틀림)
                      </p>
                      <p className="text-gray-900">{wrongAnswer.wrongAnswer}</p>
                    </div>

                    {/* 정답 */}
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-700 mb-1">정답</p>
                      <p className="text-gray-900">{wrongAnswer.correctAnswer}</p>
                    </div>

                    {/* 해설 */}
                    {wrongAnswer.explanation && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-700 mb-1">해설</p>
                        <p className="text-gray-900">{wrongAnswer.explanation}</p>
                      </div>
                    )}

                    {/* 작성일 */}
                    <div className="mt-3 text-xs text-gray-500">
                      틀린 날짜:{' '}
                      {new Date(wrongAnswer.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>

                  {/* 복습 상태 */}
                  <div className="ml-4 flex flex-col items-end gap-2">
                    {wrongAnswer.isReviewed ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        복습 완료
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                        복습 필요
                      </span>
                    )}
                    <Link
                      href={`/student/wrong-answers/${wrongAnswer.id}`}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      다시 풀기
                    </Link>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

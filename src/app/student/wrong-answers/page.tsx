'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
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
    id: string;
    exam: {
      id: string;
      title: string;
      category: string;
    };
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
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', res.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch wrong answers');
      }

      const data = await res.json();
      console.log('Wrong answers data:', data);
      setWrongAnswers(data.wrongAnswers);
      setStats(data.stats);
    } catch (error) {
      console.error('Error:', error);
      alert(`오답 목록을 불러오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
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
    <div className="space-y-6 sm:space-y-12 lg:space-y-20 pb-8 sm:pb-16">
      {/* Page Header */}
      <div className="relative rounded-lg bg-white p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900">오답 노트</h1>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-1 sm:mt-2">틀린 문제를 다시 풀어보고 복습하세요</p>
      </div>

      {/* 통계 */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* 전체 오답 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
            <div className="relative bg-white rounded-lg p-3 sm:p-4 lg:p-6 m-0.5 sm:m-1 border border-gray-200">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">전체 오답</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalWrong}개</p>
              </div>
            </div>
          </div>

          {/* 복습 완료 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
            <div className="relative bg-white rounded-lg p-3 sm:p-4 lg:p-6 m-0.5 sm:m-1 border border-gray-200">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">복습 완료</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.reviewedCount}개
                </p>
              </div>
            </div>
          </div>

          {/* 복습 필요 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
            <div className="relative bg-white rounded-lg p-3 sm:p-4 lg:p-6 m-0.5 sm:m-1 border border-gray-200">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">복습 필요</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.unreviewedCount}개</p>
              </div>
            </div>
          </div>

          {/* 복습률 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
            <div className="relative bg-white rounded-lg p-3 sm:p-4 lg:p-6 m-0.5 sm:m-1 border border-gray-200">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">복습률</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.totalWrong > 0
                    ? Math.round((stats.reviewedCount / stats.totalWrong) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 자주 틀리는 카테고리 */}
      {stats && stats.frequentCategories.length > 0 && (
        <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
            자주 틀리는 카테고리
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {stats.frequentCategories.map((cat, index) => {
              const ranks = ['1위', '2위', '3위'];
              return (
                <div
                  key={index}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
                  <div className="relative bg-white rounded-lg p-2 sm:p-4 m-0.5 sm:m-1 border border-gray-200">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm font-bold text-purple-500">{ranks[index]}</span>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">{cat.category}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{cat.count}개</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 border-2 border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <label className="text-xs sm:text-sm font-bold text-gray-700 whitespace-nowrap">카테고리:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="">전체</option>
              <option value="비문학">비문학</option>
              <option value="문학">문학</option>
              <option value="문법">문법</option>
            </select>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="text-xs sm:text-sm font-bold text-gray-700 whitespace-nowrap">복습 상태:</label>
            <select
              value={selectedReviewStatus}
              onChange={(e) => setSelectedReviewStatus(e.target.value)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="">전체</option>
              <option value="false">복습 필요</option>
              <option value="true">복습 완료</option>
            </select>
          </div>
        </div>
      </div>

      {/* 오답 목록 */}
      {wrongAnswers.length === 0 ? (
        <Card>
          <Card.Body className="p-6 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎉</div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              오답이 없습니다
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              훌륭합니다! 모든 문제를 맞혔거나 아직 학습을 시작하지 않았습니다.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {wrongAnswers.map((wrongAnswer) => (
            <Card key={wrongAnswer.id}>
              <Card.Body className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                  <div className="flex-1">
                    {/* 시험 정보 */}
                    <div className="mb-2 sm:mb-3">
                      <div className="flex items-start justify-between gap-2 sm:block">
                        <Link
                          href={`/teacher/results/${wrongAnswer.examResult.id}`}
                          className="text-xs sm:text-sm font-medium text-purple-600 hover:text-purple-800 line-clamp-1"
                        >
                          {wrongAnswer.examResult.exam.title}
                        </Link>
                        {/* 모바일에서 복습 상태 표시 */}
                        <div className="sm:hidden flex-shrink-0">
                          {wrongAnswer.isReviewed ? (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              복습 완료
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              복습 필요
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-blue-50 text-blue-600 rounded font-medium">
                          {wrongAnswer.category}
                        </span>
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-blue-50 text-blue-600 rounded font-medium">
                          {wrongAnswer.questionType}
                        </span>
                      </div>
                    </div>

                    {/* 문제 */}
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">문제</p>
                      <p className="text-sm sm:text-base text-gray-900 line-clamp-3 sm:line-clamp-none">{wrongAnswer.questionText}</p>
                    </div>

                    {/* 내 답변 (틀린 답) */}
                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-white rounded-lg border-2 border-gray-300">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5 sm:mb-1">
                        내 답변 (틀림)
                      </p>
                      <p className="text-sm sm:text-base text-gray-700">
                        {wrongAnswer.studentAnswer.length > 0
                          ? wrongAnswer.studentAnswer.join(', ')
                          : '(답안 없음)'}
                      </p>
                    </div>

                    {/* 정답 */}
                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-white rounded-lg border-2 border-gray-900">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5 sm:mb-1">정답</p>
                      <p className="text-sm sm:text-base text-gray-700">{wrongAnswer.correctAnswer.join(', ')}</p>
                    </div>

                    {/* 해설 */}
                    {wrongAnswer.explanation && (
                      <div className="p-2 sm:p-3 bg-white rounded-lg border-2 border-gray-200">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5 sm:mb-1">해설</p>
                        <p className="text-sm sm:text-base text-gray-700">{wrongAnswer.explanation}</p>
                      </div>
                    )}

                    {/* 작성일 */}
                    <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-500">
                      틀린 날짜:{' '}
                      {new Date(wrongAnswer.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>

                  {/* 복습 상태 - 데스크탑 */}
                  <div className="hidden sm:flex ml-4 flex-col items-end gap-2">
                    {wrongAnswer.isReviewed ? (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                        복습 완료
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                        복습 필요
                      </span>
                    )}
                    <Link
                      href={`/student/wrong-answers/${wrongAnswer.id}`}
                      className="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors border-2 border-gray-900"
                    >
                      다시 풀기
                    </Link>
                  </div>

                  {/* 다시 풀기 버튼 - 모바일 */}
                  <Link
                    href={`/student/wrong-answers/${wrongAnswer.id}`}
                    className="sm:hidden w-full px-4 py-2.5 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 active:bg-purple-700 transition-colors border-2 border-gray-900 text-center"
                  >
                    다시 풀기
                  </Link>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

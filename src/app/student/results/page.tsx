'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';

interface Result {
  id: string;
  totalTime: number;
  score: number;
  submittedAt: string;
  exam: {
    id: string;
    title: string;
    category: string;
    targetSchool: string;
    targetGrade: number;
  };
}

interface Stats {
  totalResults: number;
  averageScore: number;
  totalReadingTime: number;
  highestScore: number;
  lowestScore: number;
}

export default function StudentResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchResults();
  }, [selectedCategory]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);

      const res = await fetch(`/api/student/results?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch results');

      const data = await res.json();
      setResults(data.results);
      setStats(data.stats);
    } catch (error) {
      console.error('Error:', error);
      alert('성적을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">성적을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-12 lg:space-y-20 pb-8 sm:pb-16">
      {/* Page Header */}
      <div className="relative rounded-lg bg-white p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900">내 성적</h1>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-1 sm:mt-2">학습 기록과 성적을 확인하세요</p>
      </div>

      {/* 통계 */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
            <div className="relative bg-white rounded-lg p-3 sm:p-4 lg:p-6 m-0.5 sm:m-1 border border-gray-200">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">총 학습</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.totalResults}회
                </p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
            <div className="relative bg-white rounded-lg p-3 sm:p-4 lg:p-6 m-0.5 sm:m-1 border border-gray-200">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">평균 점수</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.averageScore}점
                </p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
            <div className="relative bg-white rounded-lg p-3 sm:p-4 lg:p-6 m-0.5 sm:m-1 border border-gray-200">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">최고 점수</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.highestScore}점
                </p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
            <div className="relative bg-white rounded-lg p-3 sm:p-4 lg:p-6 m-0.5 sm:m-1 border border-gray-200">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">최저 점수</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.lowestScore}점
                </p>
              </div>
            </div>
          </div>

          <div className="relative group col-span-2 sm:col-span-1">
            <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
            <div className="relative bg-white rounded-lg p-3 sm:p-4 lg:p-6 m-0.5 sm:m-1 border border-gray-200">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">총 학습 시간</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {Math.floor(stats.totalReadingTime / 60)}분
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 border-2 border-gray-200">
        <div className="flex items-center gap-2 sm:gap-4">
          <label className="text-xs sm:text-sm font-bold text-gray-700">카테고리:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          >
            <option value="">전체</option>
            <option value="비문학">비문학</option>
            <option value="문학">문학</option>
            <option value="문법">문법</option>
            <option value="어휘">어휘</option>
            <option value="기타">기타</option>
          </select>
        </div>
      </div>

      {/* 성적 목록 */}
      {results.length === 0 ? (
        <Card>
          <Card.Body className="p-6 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📚</div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              시험 결과가 없습니다
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mt-2 mb-4 sm:mb-6">
              시험을 응시하고 성적을 확인해보세요!
            </p>
            <Link
              href="/student/exams"
              className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-sm sm:text-base border-2 border-gray-900"
            >
              시험 목록 보기
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* 모바일: 카드 형태 */}
          <div className="sm:hidden space-y-3">
            <h2 className="text-base font-semibold text-gray-900 px-1">
              시험 결과 ({results.length}개)
            </h2>
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/student/exams/${result.exam.id}/result`}
                className="block bg-white rounded-lg border-2 border-gray-200 p-4 hover:shadow-md active:bg-gray-50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2">
                      {result.exam.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-600">
                        {result.exam.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {result.exam.targetSchool} {result.exam.targetGrade}학년
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>
                        {Math.floor(result.totalTime / 60)}분 {result.totalTime % 60}초
                      </span>
                      <span>
                        {new Date(result.submittedAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-black text-purple-500">
                      {result.score}
                    </div>
                    <div className="text-xs text-gray-500">점</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 데스크탑: 테이블 형태 */}
          <Card className="hidden sm:block">
            <Card.Header className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                시험 결과 ({results.length}개)
              </h2>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        시험지
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        카테고리
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        대상
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        점수
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        소요 시간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제출일
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {result.exam.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-600">
                            {result.exam.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {result.exam.targetSchool} {result.exam.targetGrade}학년
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-purple-500">
                              {result.score}점
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {Math.floor(result.totalTime / 60)}분{' '}
                            {result.totalTime % 60}초
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(result.submittedAt).toLocaleDateString('ko-KR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(result.submittedAt).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/student/exams/${result.exam.id}/result`}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                          >
                            상세 보기
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}

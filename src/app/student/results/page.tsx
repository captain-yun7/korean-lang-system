'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';

interface Result {
  id: string;
  readingTime: number;
  score: number;
  submittedAt: string;
  passage: {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    difficulty: string;
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">내 성적</h1>
        <p className="text-gray-600 mt-1">학습 기록과 성적을 확인하세요</p>
      </div>

      {/* 통계 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">총 학습</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalResults}회
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">평균 점수</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {stats.averageScore}점
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">최고 점수</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.highestScore}점
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">최저 점수</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.lowestScore}점
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">총 학습 시간</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {Math.floor(stats.totalReadingTime / 60)}분
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
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
          </div>
        </Card.Body>
      </Card>

      {/* 성적 목록 */}
      {results.length === 0 ? (
        <Card>
          <Card.Body className="p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900">
              학습 기록이 없습니다
            </h3>
            <p className="text-gray-600 mt-2 mb-6">
              지문을 학습하고 성적을 확인해보세요!
            </p>
            <Link
              href="/student/study/self"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              학습 시작하기
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Header className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              학습 기록 ({results.length}개)
            </h2>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      지문
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      난이도
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      점수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      독해 시간
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
                          {result.passage.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.passage.subcategory}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {result.passage.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {result.passage.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`text-lg font-bold ${
                              result.score >= 80
                                ? 'text-green-600'
                                : result.score >= 60
                                ? 'text-indigo-600'
                                : 'text-red-600'
                            }`}
                          >
                            {result.score}점
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Math.floor(result.readingTime / 60)}분{' '}
                          {result.readingTime % 60}초
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
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/student/study/result/${result.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
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
      )}
    </div>
  );
}

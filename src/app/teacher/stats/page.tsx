'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Overview {
  totalStudents: number;
  totalPassages: number;
  totalExams: number;
  totalResults: number;
  totalWrongAnswers: number;
  avgScore: number;
}

interface GradeStat {
  grade: number;
  avgScore: number;
  count: number;
}

interface ClassStat {
  grade: number;
  class: number;
  avgScore: number;
  count: number;
}

interface CategoryStat {
  category: string;
  avgScore: number;
  count: number;
}

interface TargetGradeStat {
  targetSchool: string;
  targetGrade: number;
  avgScore: number;
  count: number;
}

interface TrendData {
  date: string;
  avgScore: number;
  count: number;
}

interface Statistics {
  overview: Overview;
  gradeStats: GradeStat[];
  classStats: ClassStat[];
  categoryStats: CategoryStat[];
  targetGradeStats: TargetGradeStat[];
  recentTrend: TrendData[];
}

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/statistics');

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `Failed to fetch statistics: ${res.status}`);
      }

      const data = await res.json();
      console.log('Statistics data:', data);
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      alert(`통계 정보를 불러오는데 실패했습니다.\n${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!statistics) return null;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">통계 분석</h1>
        <p className="text-gray-600 mt-1">
          학습 성과를 다양한 관점에서 분석하세요
        </p>
      </div>

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {statistics.overview.totalStudents}
            </p>
            <p className="text-sm text-gray-500 mt-1">전체 학생</p>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {statistics.overview.totalPassages}
            </p>
            <p className="text-sm text-gray-500 mt-1">등록 지문</p>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {statistics.overview.totalExams}
            </p>
            <p className="text-sm text-gray-500 mt-1">등록 시험지</p>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {statistics.overview.totalResults}
            </p>
            <p className="text-sm text-gray-500 mt-1">제출 성적</p>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {statistics.overview.avgScore}점
            </p>
            <p className="text-sm text-gray-500 mt-1">전체 평균</p>
          </div>
        </Card>
      </div>

      {/* 최근 30일 성적 추이 */}
      {statistics.recentTrend.length > 0 && (
        <Card padding="md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            최근 30일 성적 추이
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statistics.recentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="#4f46e5"
                strokeWidth={2}
                name="평균 점수"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 학년별 평균 점수 */}
      {statistics.gradeStats.length > 0 && (
        <Card padding="md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            학년별 평균 점수
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statistics.gradeStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="grade"
                tickFormatter={(value) => `${value}학년`}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value: any, name: string) => [
                  `${value}점`,
                  name === 'avgScore' ? '평균 점수' : name,
                ]}
                labelFormatter={(label) => `${label}학년`}
              />
              <Legend formatter={(value) => (value === 'avgScore' ? '평균 점수' : value)} />
              <Bar dataKey="avgScore" fill="#4f46e5" name="avgScore" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 반별 평균 점수 */}
      {statistics.classStats.length > 0 && (
        <Card padding="md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            반별 평균 점수
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={statistics.classStats.map((stat) => ({
                ...stat,
                label: `${stat.grade}-${stat.class}`,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickFormatter={(value) => {
                  const [grade, classNum] = value.split('-');
                  return `${grade}학년 ${classNum}반`;
                }}
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value: any) => [`${value}점`, '평균 점수']}
                labelFormatter={(label) => {
                  const [grade, classNum] = label.split('-');
                  return `${grade}학년 ${classNum}반`;
                }}
              />
              <Legend formatter={() => '평균 점수'} />
              <Bar dataKey="avgScore" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 카테고리별 평균 점수 */}
      {statistics.categoryStats.length > 0 && (
        <Card padding="md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            카테고리별 평균 점수
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statistics.categoryStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value: any) => [`${value}점`, '평균 점수']} />
              <Legend formatter={() => '평균 점수'} />
              <Bar dataKey="avgScore" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 대상 학년별 평균 점수 */}
      {statistics.targetGradeStats.length > 0 && (
        <Card padding="md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            시험 대상 학년별 평균 점수
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    학교급
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    학년
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    평균 점수
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    제출 수
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {statistics.targetGradeStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {stat.targetSchool}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {stat.targetGrade}학년
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          stat.avgScore >= 90
                            ? 'bg-green-100 text-green-800'
                            : stat.avgScore >= 70
                            ? 'bg-blue-100 text-blue-800'
                            : stat.avgScore >= 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {stat.avgScore}점
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 text-right">
                      {stat.count}회
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

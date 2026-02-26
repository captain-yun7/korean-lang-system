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

interface StudentListItem {
  id: string;
  studentId: string;
  name: string;
  grade: number;
  class: number;
  number: number;
}

interface ExamStat {
  examId: string;
  title: string;
  category: string;
  maxScore: number;
  avgScore: number;
  minScore: number;
  count: number;
}

interface SubcategoryStat {
  category: string;
  subcategory: string;
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
  studentList: StudentListItem[];
  examStats: ExamStat[];
  subcategoryStats: SubcategoryStat[];
}

// 개인별 통계 데이터
interface StudentTrendItem {
  date: string;
  examTitle: string;
  category: string;
  score: number;
  attemptNumber: number;
}

interface StudentStatData {
  student: StudentListItem;
  summary: {
    totalExams: number;
    avgScore: number;
    highestScore: number;
    lowestScore: number;
  };
  trendData: StudentTrendItem[];
  categoryAvg: CategoryStat[];
}

type TabType = 'overview' | 'student' | 'exam' | 'subcategory';

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // 개인별 통계
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentStat, setStudentStat] = useState<StudentStatData | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/statistics');

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch statistics: ${res.status}`);
      }

      const data = await res.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      alert(`통계 정보를 불러오는데 실패했습니다.\n${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentStat = async (studentId: string) => {
    if (!studentId) {
      setStudentStat(null);
      return;
    }

    try {
      setStudentLoading(true);
      const res = await fetch(`/api/teacher/statistics/student?studentId=${studentId}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch student statistics');
      }

      const data = await res.json();
      setStudentStat(data);
    } catch (error) {
      console.error('Error fetching student statistics:', error);
      alert('학생 통계를 불러오는데 실패했습니다.');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    fetchStudentStat(studentId);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!statistics) return null;

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overview', label: '전체 통계' },
    { key: 'student', label: '개인별 통계' },
    { key: 'exam', label: '시험지별 통계' },
    { key: 'subcategory', label: '파트별 통계' },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">통계 분석</h1>
        <p className="text-gray-600 mt-1">
          학습 성과를 다양한 관점에서 분석하세요
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap text-sm ${
              activeTab === tab.key
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== 전체 통계 탭 ===== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
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
      )}

      {/* ===== 개인별 통계 탭 ===== */}
      {activeTab === 'student' && (
        <div className="space-y-6">
          {/* 학생 선택 */}
          <Card padding="md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">학생 선택</h2>
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">학생을 선택하세요</option>
              {statistics.studentList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.grade}학년 {s.class}반 {s.number}번 - {s.name} ({s.studentId})
                </option>
              ))}
            </select>
          </Card>

          {studentLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          )}

          {studentStat && !studentLoading && (
            <>
              {/* 개인 요약 카드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card padding="md">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">
                      {studentStat.summary.totalExams}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">총 응시</p>
                  </div>
                </Card>
                <Card padding="md">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {studentStat.summary.avgScore}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">평균 점수</p>
                  </div>
                </Card>
                <Card padding="md">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {studentStat.summary.highestScore}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">최고점</p>
                  </div>
                </Card>
                <Card padding="md">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-500">
                      {studentStat.summary.lowestScore}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">최저점</p>
                  </div>
                </Card>
              </div>

              {/* 개인 성적 추이 꺾은선 그래프 */}
              {studentStat.trendData.length > 0 && (
                <Card padding="md">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {studentStat.student.name} 학생 성적 추이
                  </h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={studentStat.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length > 0) {
                            const data = payload[0].payload as StudentTrendItem;
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                <p className="font-semibold text-gray-900">{data.examTitle}</p>
                                <p className="text-sm text-gray-600">{data.date}</p>
                                <p className="text-sm text-gray-600">{data.category}</p>
                                <p className="text-lg font-bold text-indigo-600">{data.score}점</p>
                                {data.attemptNumber > 1 && (
                                  <p className="text-xs text-blue-500">{data.attemptNumber}회차</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={{ fill: '#4f46e5', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="점수"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* 개인 카테고리별 평균 */}
              {studentStat.categoryAvg.length > 0 && (
                <Card padding="md">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    카테고리별 평균 점수
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={studentStat.categoryAvg}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value: any) => [`${value}점`, '평균 점수']} />
                      <Legend formatter={() => '평균 점수'} />
                      <Bar dataKey="avgScore" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {studentStat.trendData.length === 0 && (
                <Card padding="md">
                  <div className="text-center py-8 text-gray-500">
                    아직 응시한 시험이 없습니다.
                  </div>
                </Card>
              )}
            </>
          )}

          {!selectedStudentId && (
            <Card padding="md">
              <div className="text-center py-12 text-gray-500">
                학생을 선택하면 개인별 성적 추이를 확인할 수 있습니다.
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ===== 시험지별 통계 탭 ===== */}
      {activeTab === 'exam' && (
        <div className="space-y-6">
          {statistics.examStats.length > 0 ? (
            <Card padding="md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                시험지별 최고점 / 평균 / 최저점
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        시험지
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        카테고리
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        최고점
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        평균
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        최저점
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        응시 수
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {statistics.examStats.map((stat) => (
                      <tr key={stat.examId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                          {stat.title}
                        </td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {stat.category}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          <span className="font-semibold text-green-600">{stat.maxScore}점</span>
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
                        <td className="px-4 py-2 text-sm text-right">
                          <span className="font-semibold text-red-500">{stat.minScore}점</span>
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
          ) : (
            <Card padding="md">
              <div className="text-center py-12 text-gray-500">
                아직 시험 결과가 없습니다.
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ===== 파트별 세분화 통계 탭 ===== */}
      {activeTab === 'subcategory' && (
        <div className="space-y-6">
          {statistics.subcategoryStats.length > 0 ? (
            <Card padding="md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                비문학 / 문학 파트별 평균 점수
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={statistics.subcategoryStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="subcategory"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value: any) => [`${value}점`, '평균 점수']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend formatter={() => '평균 점수'} />
                  <Bar dataKey="avgScore" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>

              {/* 테이블 형태로도 표시 */}
              <div className="overflow-x-auto mt-6">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        대분류
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        세부 파트
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        평균 점수
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        응시 수
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {statistics.subcategoryStats.map((stat, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            stat.category === '비문학'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}>
                            {stat.category}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                          {stat.subcategory}
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
          ) : (
            <Card padding="md">
              <div className="text-center py-12 text-gray-500">
                <p>파트별 통계 데이터가 없습니다.</p>
                <p className="text-sm mt-2">시험지에 지문(Passage)이 연동된 결과가 있어야 표시됩니다.</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

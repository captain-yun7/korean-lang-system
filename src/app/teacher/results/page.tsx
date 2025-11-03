'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';

interface ExamResult {
  id: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  elapsedTime: number;
  submittedAt: string;
  student: {
    id: string;
    name: string;
    schoolLevel: string;
    grade: number;
    class: number;
    number: number;
  };
  exam: {
    id: string;
    title: string;
    category: string;
    targetSchool: string;
    targetGrade: number;
  };
}

interface Student {
  id: string;
  name: string;
  schoolLevel: string;
  grade: number;
  class: number;
  number: number;
}

interface Exam {
  id: string;
  title: string;
  category: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // 필터 상태
  const [filters, setFilters] = useState({
    studentId: '',
    examId: '',
    category: '',
    startDate: '',
    endDate: '',
    sortBy: 'submittedAt',
    sortOrder: 'desc',
  });

  // 성적 목록 조회
  useEffect(() => {
    fetchResults();
  }, [currentPage, filters]);

  // 학생 목록 및 시험지 목록 조회 (필터용)
  useEffect(() => {
    fetchStudents();
    fetchExams();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filters.studentId && { studentId: filters.studentId }),
        ...(filters.examId && { examId: filters.examId }),
        ...(filters.category && { category: filters.category }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const res = await fetch(`/api/teacher/results?${params}`);
      if (!res.ok) throw new Error('Failed to fetch results');

      const data = await res.json();
      setResults(data.results);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error:', error);
      alert('성적 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/teacher/students');
      if (!res.ok) throw new Error('Failed to fetch students');

      const data = await res.json();
      setStudents(data.students);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/teacher/exams');
      if (!res.ok) throw new Error('Failed to fetch exams');

      const data = await res.json();
      setExams(data.examPapers);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분 ${secs}초`;
  };

  const handleExcelDownload = () => {
    const params = new URLSearchParams({
      ...(filters.studentId && { studentId: filters.studentId }),
      ...(filters.examId && { examId: filters.examId }),
      ...(filters.category && { category: filters.category }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });

    window.open(`/api/teacher/results/export?${params}`, '_blank');
  };

  const CATEGORIES = ['비문학', '문학', '문법', '어휘', '기타'];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">성적 관리</h1>
          <p className="text-gray-600 mt-1">
            학생들의 시험 성적을 조회하고 관리하세요
          </p>
        </div>
        <Button variant="primary" onClick={handleExcelDownload}>
          Excel 다운로드
        </Button>
      </div>

      {/* 필터 */}
      <Card padding="md">
        <div className="space-y-4">
          {/* 첫 번째 행 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 학생 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                학생
              </label>
              <select
                value={filters.studentId}
                onChange={(e) => handleFilterChange('studentId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">전체</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.schoolLevel} {student.grade}학년 {student.class}반{' '}
                    {student.number}번)
                  </option>
                ))}
              </select>
            </div>

            {/* 시험지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시험지
              </label>
              <select
                value={filters.examId}
                onChange={(e) => handleFilterChange('examId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">전체</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                영역
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">전체</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* 정렬 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                정렬
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="submittedAt">제출일</option>
                  <option value="score">점수</option>
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) =>
                    handleFilterChange('sortOrder', e.target.value)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="desc">내림차순</option>
                  <option value="asc">오름차순</option>
                </select>
              </div>
            </div>
          </div>

          {/* 두 번째 행 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 시작일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작일
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* 종료일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료일
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 성적 목록 */}
      <Card padding="none">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">성적이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      학생
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      시험지
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      점수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      정답률
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      소요 시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제출일
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => {
                    const accuracy = result.totalQuestions > 0
                      ? Math.round((result.correctCount / result.totalQuestions) * 100)
                      : 0;

                    return (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {result.student.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {result.student.schoolLevel} {result.student.grade}학년{' '}
                            {result.student.class}반 {result.student.number}번
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {result.exam.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {result.exam.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              result.score >= 90
                                ? 'bg-green-100 text-green-800'
                                : result.score >= 70
                                ? 'bg-blue-100 text-blue-800'
                                : result.score >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {result.score}점
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {accuracy}% ({result.correctCount}/{result.totalQuestions})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(result.elapsedTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(result.submittedAt).toLocaleString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/teacher/results/${result.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            상세
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

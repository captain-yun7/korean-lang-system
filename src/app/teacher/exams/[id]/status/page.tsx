'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui';

interface Student {
  id: string;
  studentId: string;
  name: string;
  schoolLevel: string;
  grade: number;
  class: number;
  number: number;
}

interface StudentStatus {
  assignmentId: string;
  dueDate: string | null;
  student: Student;
  isCompleted: boolean;
  result: {
    id: string;
    score: number;
    submittedAt: string;
  } | null;
}

interface ExamStatusData {
  exam: {
    id: string;
    title: string;
    category: string;
    targetSchool: string;
    targetGrade: number;
  };
  statistics: {
    totalAssigned: number;
    completedCount: number;
    incompletedCount: number;
    completionRate: number;
  };
  students: StudentStatus[];
}

type FilterType = 'all' | 'completed' | 'incompleted';

export default function ExamStatusPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [data, setData] = useState<ExamStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    fetchExamStatus();
  }, [examId]);

  const fetchExamStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/teacher/exams/${examId}/status`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '응시 현황 조회에 실패했습니다.');
      }

      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredStudents = () => {
    if (!data) return [];

    switch (filter) {
      case 'completed':
        return data.students.filter((s) => s.isCompleted);
      case 'incompleted':
        return data.students.filter((s) => !s.isCompleted);
      default:
        return data.students;
    }
  };

  const getDDay = (dueDate: string | null) => {
    if (!dueDate) return null;

    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    if (diffDays === 0) return 'D-Day';
    return `D-${diffDays}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || '데이터를 불러올 수 없습니다.'}
        </div>
        <Link
          href={`/teacher/exams/${examId}`}
          className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          돌아가기
        </Link>
      </div>
    );
  }

  const filteredStudents = getFilteredStudents();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">응시 현황</h1>
            <p className="text-gray-600 mt-1">{data.exam.title}</p>
            <p className="text-sm text-gray-500 mt-1">
              {data.exam.category} · {data.exam.targetSchool} {data.exam.targetGrade}학년
            </p>
          </div>
          <Link
            href={`/teacher/exams/${examId}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            시험지로 돌아가기
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body className="p-6">
            <p className="text-sm text-gray-600">전체 배정</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {data.statistics.totalAssigned}
              <span className="text-lg text-gray-500 ml-1">명</span>
            </p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <p className="text-sm text-gray-600">완료</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {data.statistics.completedCount}
              <span className="text-lg text-gray-500 ml-1">명</span>
            </p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <p className="text-sm text-gray-600">미완료</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {data.statistics.incompletedCount}
              <span className="text-lg text-gray-500 ml-1">명</span>
            </p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <p className="text-sm text-gray-600">완료율</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {data.statistics.completionRate}
              <span className="text-lg text-gray-500 ml-1">%</span>
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          전체 ({data.statistics.totalAssigned})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'completed'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          완료 ({data.statistics.completedCount})
        </button>
        <button
          onClick={() => setFilter('incompleted')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'incompleted'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          미완료 ({data.statistics.incompletedCount})
        </button>
      </div>

      {/* Students Table */}
      <Card>
        <Card.Body className="p-6">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              해당하는 학생이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      학번
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      이름
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      학년/반/번호
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      상태
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      점수
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      제출일/마감일
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const dDay = student.dueDate ? getDDay(student.dueDate) : null;
                    const isOverdue = dDay?.startsWith('D+');

                    return (
                      <tr
                        key={student.assignmentId}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {student.student.studentId}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {student.student.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {student.student.grade}학년 {student.student.class}반{' '}
                          {student.student.number}번
                        </td>
                        <td className="py-3 px-4 text-center">
                          {student.isCompleted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              완료
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              미완료
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {student.result ? (
                            <span
                              className={`text-sm font-semibold ${
                                student.result.score >= 90
                                  ? 'text-green-600'
                                  : student.result.score >= 70
                                  ? 'text-blue-600'
                                  : student.result.score >= 50
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {student.result.score}점
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {student.result ? (
                            <div>
                              <div>{formatDate(student.result.submittedAt)}</div>
                            </div>
                          ) : student.dueDate ? (
                            <div className="flex items-center gap-2">
                              <div>{formatDate(student.dueDate)}</div>
                              {dDay && (
                                <span
                                  className={`text-xs font-medium ${
                                    isOverdue
                                      ? 'text-red-600'
                                      : dDay === 'D-Day'
                                      ? 'text-orange-600'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  ({dDay})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">기한 없음</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {student.result ? (
                            <Link
                              href={`/teacher/results/${student.result.id}`}
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              상세보기
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

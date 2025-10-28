'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';

interface Assignment {
  id: string;
  passageId: string;
  passage: {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    difficulty: string;
    _count: {
      questions: number;
    };
  };
  dueDate: string | null;
  createdAt: string;
  isCompleted: boolean;
  completedAt: string | null;
  score: number | null;
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export default function AssignedStudyPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/assignments');
      if (!res.ok) throw new Error('Failed to fetch assignments');

      const data = await res.json();
      setAssignments(data.assignments);
      setStats(data.stats);
    } catch (error) {
      console.error('Error:', error);
      alert('과제를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAssignments = () => {
    switch (filter) {
      case 'pending':
        return assignments.filter((a) => !a.isCompleted);
      case 'completed':
        return assignments.filter((a) => a.isCompleted);
      case 'overdue':
        return assignments.filter(
          (a) => !a.isCompleted && a.dueDate && new Date(a.dueDate) < new Date()
        );
      default:
        return assignments;
    }
  };

  const getDueDateStatus = (assignment: Assignment) => {
    if (!assignment.dueDate) return null;
    if (assignment.isCompleted) return 'completed';

    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'urgent';
    return 'normal';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">과제를 불러오는 중...</p>
      </div>
    );
  }

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">교사 지정 학습</h1>
        <p className="text-gray-600 mt-1">선생님이 배정한 과제를 완료하세요</p>
      </div>

      {/* 통계 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">전체 과제</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.total}개</p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">완료</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.completed}개
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">미완료</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {stats.pending}개
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">마감 초과</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue}개</p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">완료율</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats.completionRate}%
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* 필터 */}
      <Card>
        <Card.Body className="p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체 ({stats?.total || 0})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              미완료 ({stats?.pending || 0})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              완료 ({stats?.completed || 0})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              마감 초과 ({stats?.overdue || 0})
            </button>
          </div>
        </Card.Body>
      </Card>

      {/* 과제 목록 */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <Card.Body className="p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900">
              {filter === 'all' ? '배정된 과제가 없습니다' : '해당하는 과제가 없습니다'}
            </h3>
            <p className="text-gray-600 mt-2">
              {filter === 'all'
                ? '선생님이 과제를 배정하면 여기에 표시됩니다.'
                : '다른 필터를 선택해보세요.'}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const dueDateStatus = getDueDateStatus(assignment);

            return (
              <Card key={assignment.id}>
                <Card.Body className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 제목 및 상태 */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {assignment.passage.title}
                        </h3>
                        {assignment.isCompleted ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            완료
                          </span>
                        ) : dueDateStatus === 'overdue' ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                            마감 초과
                          </span>
                        ) : dueDateStatus === 'urgent' ? (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                            마감 임박
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                            진행중
                          </span>
                        )}
                      </div>

                      {/* 지문 정보 */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          {assignment.passage.category}
                        </span>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                          {assignment.passage.subcategory}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {assignment.passage.difficulty}
                        </span>
                        <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded">
                          문제 {assignment.passage._count.questions}개
                        </span>
                      </div>

                      {/* 날짜 정보 */}
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          배정일:{' '}
                          {new Date(assignment.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {assignment.dueDate && (
                          <p
                            className={
                              dueDateStatus === 'overdue'
                                ? 'text-red-600 font-semibold'
                                : dueDateStatus === 'urgent'
                                ? 'text-orange-600 font-semibold'
                                : ''
                            }
                          >
                            마감일:{' '}
                            {new Date(assignment.dueDate).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                        {assignment.isCompleted && assignment.completedAt && (
                          <p className="text-green-600">
                            완료일:{' '}
                            {new Date(assignment.completedAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                      </div>

                      {/* 점수 */}
                      {assignment.isCompleted && assignment.score !== null && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            점수:{' '}
                            <span
                              className={`font-bold text-lg ${
                                assignment.score >= 80
                                  ? 'text-green-600'
                                  : assignment.score >= 60
                                  ? 'text-indigo-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {assignment.score}점
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="ml-4">
                      {assignment.isCompleted ? (
                        <Link
                          href={`/student/study/reading/${assignment.passageId}`}
                          className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors inline-block"
                        >
                          다시 풀기
                        </Link>
                      ) : (
                        <Link
                          href={`/student/study/reading/${assignment.passageId}`}
                          className={`px-4 py-2 text-white text-sm rounded-lg transition-colors inline-block ${
                            dueDateStatus === 'overdue'
                              ? 'bg-red-600 hover:bg-red-700'
                              : dueDateStatus === 'urgent'
                              ? 'bg-orange-600 hover:bg-orange-700'
                              : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          학습 시작
                        </Link>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

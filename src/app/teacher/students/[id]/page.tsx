'use client';

import { Card } from '@/components/ui';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface ExamListItem {
  id: string;
  title: string;
  category: string;
  targetSchool: string;
  targetGrade: number;
}

interface ExamInfo {
  id: string;
  title: string;
  category: string;
  examType: string;
}

interface AssignedExam {
  id: string;
  examId: string;
  dueDate: string | null;
  createdAt: string;
  exam: ExamInfo;
  isCompleted: boolean;
  result: {
    id: string;
    score: number;
    submittedAt: string;
  } | null;
}

interface ExamResult {
  id: string;
  score: number;
  totalTime: number;
  submittedAt: string;
  exam: ExamInfo;
}

interface StudentData {
  id: string;
  studentId: string;
  name: string;
  schoolLevel: string;
  grade: number;
  class: number;
  number: number;
  isActive: boolean;
  activationStartDate: string | null;
  activationEndDate: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  examResults: ExamResult[];
  assignedExams: AssignedExam[];
  selfStudyResults: ExamResult[];
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 시험지 배정 모달
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableExams, setAvailableExams] = useState<ExamListItem[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignMaxAttempts, setAssignMaxAttempts] = useState(1);
  const [isAssigning, setIsAssigning] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/teacher/students/${params.id}`);
        if (!response.ok) {
          throw new Error('학생 정보를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setStudent(data.student);
      } catch (error) {
        console.error('Failed to fetch student:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [params.id]);

  const openAssignModal = async () => {
    try {
      const res = await fetch('/api/teacher/exams?limit=100');
      const data = await res.json();
      if (res.ok) {
        setAvailableExams(data.examPapers || []);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    }
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!selectedExamId || !assignDueDate) {
      alert('시험지와 마감일을 선택해주세요.');
      return;
    }

    setIsAssigning(true);
    try {
      const res = await fetch(`/api/teacher/exams/${selectedExamId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: [student!.id],
          dueDate: new Date(assignDueDate).toISOString(),
          maxAttempts: assignMaxAttempts,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '시험지 배정에 실패했습니다.');
      }

      alert('시험지가 배정되었습니다.');
      setShowAssignModal(false);
      setSelectedExamId('');
      setAssignDueDate('');
      setAssignMaxAttempts(1);
      // 학생 데이터 새로고침
      const response = await fetch(`/api/teacher/students/${params.id}`);
      const refreshed = await response.json();
      setStudent(refreshed.student);
    } catch (error: any) {
      alert(error.message || '시험지 배정에 실패했습니다.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCancelAssignment = async (assignmentId: string, examId: string, examTitle: string) => {
    if (!confirm(`"${examTitle}" 시험지 배정을 취소하시겠습니까?`)) return;

    setCancellingId(assignmentId);
    try {
      const res = await fetch(
        `/api/teacher/exams/${examId}/assign?assignmentId=${assignmentId}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '배정 취소에 실패했습니다.');
      }
      alert('배정이 취소되었습니다.');
      const response = await fetch(`/api/teacher/students/${params.id}`);
      const refreshed = await response.json();
      setStudent(refreshed.student);
    } catch (error: any) {
      alert(error.message || '배정 취소에 실패했습니다.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleDelete = async () => {
    if (!student) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/teacher/students/${student.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('학생 삭제에 실패했습니다.');
      }

      alert('학생이 성공적으로 삭제되었습니다.');
      router.push('/teacher/students');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete student:', error);
      alert('학생 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">학생 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 학습 통계 계산
  const stats = {
    totalResults: student.examResults?.length || 0,
    averageScore: student.examResults && student.examResults.length > 0
      ? Math.round(
          (student.examResults.reduce((sum, r) => sum + r.score, 0) /
            student.examResults.length) *
            10
        ) / 10
      : 0,
    totalTime: student.examResults?.reduce((sum, r) => sum + r.totalTime, 0) || 0,
    assignedTotal: student.assignedExams?.length || 0,
    assignedCompleted: student.assignedExams?.filter((a) => a.isCompleted).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                student.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {student.isActive ? '활성' : '비활성'}
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            {student.grade}학년 {student.class}반 {student.number}번 · 학번: {student.studentId}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openAssignModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            시험지 배정
          </button>
          <Link
            href={`/teacher/students/${student.id}/edit`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            정보 수정
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            학생 삭제
          </button>
          <Link
            href="/teacher/students"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            목록으로
          </Link>
        </div>
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">총 학습 횟수</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalResults}회</p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">평균 점수</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.averageScore > 0 ? `${stats.averageScore}점` : '-'}
              </p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">총 학습 시간</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {Math.floor(stats.totalTime / 60)}분
              </p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">배정 시험 완료</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.assignedCompleted}/{stats.assignedTotal}
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">계정 정보</h2>
        </Card.Header>
        <Card.Body className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-600">학번</dt>
              <dd className="mt-1 text-sm text-gray-900">{student.studentId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">이름</dt>
              <dd className="mt-1 text-sm text-gray-900">{student.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">학년/반/번호</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {student.grade}학년 {student.class}반 {student.number}번
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">계정 상태</dt>
              <dd className="mt-1">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    student.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {student.isActive ? '활성' : '비활성'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">활성화 시작일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {student.activationStartDate
                  ? new Date(student.activationStartDate).toLocaleDateString('ko-KR')
                  : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">활성화 종료일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {student.activationEndDate
                  ? new Date(student.activationEndDate).toLocaleDateString('ko-KR')
                  : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">계정 생성일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(student.user.createdAt).toLocaleDateString('ko-KR')}
              </dd>
            </div>
          </dl>
        </Card.Body>
      </Card>

      {/* 배정된 시험지 */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">배정된 시험지</h2>
        </Card.Header>
        <Card.Body className="p-0">
          {student.assignedExams && student.assignedExams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      시험 제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      마감일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      점수
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {student.assignedExams.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.exam.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {assignment.exam.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {assignment.dueDate
                            ? new Date(assignment.dueDate).toLocaleDateString('ko-KR')
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            assignment.isCompleted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {assignment.isCompleted ? '완료' : '미완료'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {assignment.result ? `${assignment.result.score}점` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {assignment.result && (
                            <Link
                              href={`/teacher/results/${assignment.result.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              상세
                            </Link>
                          )}
                          {!assignment.result && (
                            <button
                              onClick={() =>
                                handleCancelAssignment(
                                  assignment.id,
                                  assignment.examId,
                                  assignment.exam.title
                                )
                              }
                              disabled={cancellingId === assignment.id}
                              className="text-red-600 hover:text-red-900 disabled:text-red-300"
                            >
                              {cancellingId === assignment.id ? '취소 중...' : '배정 취소'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">배정된 시험지가 없습니다.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* 자습용 시험지 응시 기록 */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">자습용 시험지 응시 기록</h2>
        </Card.Header>
        <Card.Body className="p-0">
          {student.selfStudyResults && student.selfStudyResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      시험 제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
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
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {student.selfStudyResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {result.exam.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.exam.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{result.score}점</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Math.floor(result.totalTime / 60)}분 {result.totalTime % 60}초
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(result.submittedAt).toLocaleDateString('ko-KR')}
                        </div>
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
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">자습용 시험지 응시 기록이 없습니다.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* 시험지 배정 모달 */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">시험지 배정</h3>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">{student.name}</span> 학생에게 시험지를 배정합니다.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시험지 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">시험지를 선택하세요</option>
                  {availableExams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.title} ({exam.category} · {exam.targetSchool} {exam.targetGrade}학년)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  마감일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최대 응시 횟수
                </label>
                <select
                  value={assignMaxAttempts}
                  onChange={(e) => setAssignMaxAttempts(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={1}>1회 (재응시 불가)</option>
                  <option value={2}>2회</option>
                  <option value={3}>3회</option>
                  <option value={5}>5회</option>
                  <option value={99}>무제한</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAssign}
                disabled={isAssigning || !selectedExamId || !assignDueDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isAssigning ? '배정 중...' : '배정'}
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                disabled={isAssigning}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">학생 삭제 확인</h3>
            <p className="text-gray-700 mb-2">
              정말로 <span className="font-bold">{student.name}</span> 학생을 삭제하시겠습니까?
            </p>
            <p className="text-sm text-red-600 mb-6">
              ⚠️ 이 작업은 되돌릴 수 없으며, 학생의 모든 학습 기록과 시험 결과가 함께 삭제됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { Card, Button } from '@/components/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Student {
  id: string;
  studentId: string;
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
  targetSchool: string;
  targetGrade: number;
}

export default function AssignExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 필터 상태
  const [schoolLevelFilter, setSchoolLevelFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 시험지 정보 가져오기
      const examResponse = await fetch(`/api/teacher/exams/${examId}`);
      const examData = await examResponse.json();

      if (!examResponse.ok) {
        throw new Error('시험지를 불러올 수 없습니다.');
      }

      setExam(examData.examPaper);

      // 학생 목록 가져오기
      const studentsResponse = await fetch('/api/teacher/students');
      const studentsData = await studentsResponse.json();

      if (!studentsResponse.ok) {
        throw new Error('학생 목록을 불러올 수 없습니다.');
      }

      setStudents(studentsData.students);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('데이터를 불러오는데 실패했습니다.');
      router.push(`/teacher/exams/${examId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedStudents.size === 0) {
      alert('배정할 학생을 선택해주세요.');
      return;
    }

    if (!dueDate) {
      alert('마감일을 선택해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/teacher/exams/${examId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds: Array.from(selectedStudents),
          dueDate: new Date(dueDate).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '시험지 배정에 실패했습니다.');
      }

      alert(`${selectedStudents.size}명의 학생에게 시험지가 배정되었습니다.`);
      router.push(`/teacher/exams/${examId}`);
    } catch (error: any) {
      alert(error.message || '시험지 배정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  // 필터링된 학생 목록
  const filteredStudents = students.filter((student) => {
    if (schoolLevelFilter && student.schoolLevel !== schoolLevelFilter) return false;
    if (gradeFilter && student.grade !== parseInt(gradeFilter)) return false;
    if (classFilter && student.class !== parseInt(classFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">시험지 배정</h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-gray-600">시험지:</span>
          <span className="font-medium text-gray-900">{exam.title}</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
            {exam.category}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-600">
            {exam.targetSchool} {exam.targetGrade}학년
          </span>
        </div>
      </div>

      {/* 마감일 설정 */}
      <Card padding="md">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">배정 설정</h2>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              마감일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              학생들이 이 날짜까지 시험을 완료해야 합니다.
            </p>
          </div>
        </div>
      </Card>

      {/* 학생 선택 */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">학생 선택</h2>
            <div className="text-sm text-gray-600">
              {selectedStudents.size}명 선택됨
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-6">
          {/* 필터 */}
          <div className="flex gap-4 mb-6">
            <div>
              <label htmlFor="schoolLevelFilter" className="block text-sm font-medium text-gray-700 mb-1">
                학교급
              </label>
              <select
                id="schoolLevelFilter"
                value={schoolLevelFilter}
                onChange={(e) => setSchoolLevelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">전체</option>
                <option value="중등">중등</option>
                <option value="고등">고등</option>
              </select>
            </div>

            <div>
              <label htmlFor="gradeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                학년
              </label>
              <select
                id="gradeFilter"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">전체</option>
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
              </select>
            </div>

            <div>
              <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-1">
                반
              </label>
              <select
                id="classFilter"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">전체</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num}반
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                {selectedStudents.size === filteredStudents.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>
          </div>

          {/* 학생 목록 */}
          {filteredStudents.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentToggle(student.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedStudents.has(student.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">
                        {student.studentId} • {student.schoolLevel} {student.grade}학년{' '}
                        {student.class}반 {student.number}번
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>조건에 맞는 학생이 없습니다.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* 하단 버튼 */}
      <div className="flex justify-between">
        <Link href={`/teacher/exams/${examId}`}>
          <Button variant="secondary">취소</Button>
        </Link>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={submitting || selectedStudents.size === 0}
        >
          {submitting ? '배정 중...' : `${selectedStudents.size}명에게 배정`}
        </Button>
      </div>
    </div>
  );
}

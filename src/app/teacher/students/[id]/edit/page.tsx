'use client';

import { Card } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
}

interface StudentFormData {
  name: string;
  userId: string; // 로그인 아이디
  schoolLevel: string; // 중등, 고등
  grade: number;
  class: number;
  number: number;
  isActive: boolean;
  activationStartDate?: string;
  activationEndDate?: string;
  password?: string;
  confirmPassword?: string;
}

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState<StudentData | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    userId: '',
    schoolLevel: '중등',
    grade: 1,
    class: 1,
    number: 1,
    isActive: true,
  });

  // 학생 정보 불러오기
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/teacher/students/${params.id}`);
        if (!response.ok) {
          throw new Error('학생 정보를 불러오지 못했습니다.');
        }
        const data = await response.json();
        setStudent(data.student);
        setFormData({
          name: data.student.name || '',
          userId: data.student.user.email || '', // user.email에 userId가 저장되어 있음
          schoolLevel: data.student.schoolLevel || '중등',
          grade: data.student.grade || 1,
          class: data.student.class || 1,
          number: data.student.number || 1,
          isActive: data.student.isActive ?? true,
          activationStartDate: data.student.activationStartDate
            ? new Date(data.student.activationStartDate).toISOString().split('T')[0]
            : '',
          activationEndDate: data.student.activationEndDate
            ? new Date(data.student.activationEndDate).toISOString().split('T')[0]
            : '',
        });
      } catch (err: any) {
        setError(err.message || '학생 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? parseInt(value)
          : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 변경 시 확인
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }
      if (formData.password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
    }

    // 필수 필드 확인
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!formData.userId.trim()) {
      setError('로그인 아이디를 입력해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/teacher/students/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '학생 정보 수정에 실패했습니다.');
      }

      // 성공 시 상세 페이지로 이동
      router.push(`/teacher/students/${params.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || '학생 정보 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">학생 정보 수정</h1>
        <p className="text-gray-600 mt-1">{student.name} ({student.studentId})</p>
      </div>

      <Card>
        <Card.Body className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* 기본 정보 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>

              {/* 학번 (수정 불가) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  학번 (변경 불가)
                </label>
                <input
                  type="text"
                  value={student.studentId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* 이름 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="홍길동"
                />
              </div>

              {/* 로그인 아이디 */}
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  로그인 아이디 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="student01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  학생이 로그인 시 사용할 아이디입니다
                </p>
              </div>

              {/* 학교급 */}
              <div>
                <label htmlFor="schoolLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  학교급 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {['중등', '고등'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        name="schoolLevel"
                        value={level}
                        checked={formData.schoolLevel === level}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>

              {/* 학년/반/번호 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                    학년 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={1}>1학년</option>
                    <option value={2}>2학년</option>
                    <option value={3}>3학년</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                    반 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}반
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                    번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    required
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 학년/반/번호 변경 시 경고 */}
              {(formData.grade !== student.grade ||
                formData.class !== student.class ||
                formData.number !== student.number) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ 학년/반/번호를 변경하면 학번이 변경됩니다. 학생이 기존 학번으로 로그인할 수 없게 됩니다.
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    새로운 학번:{' '}
                    <span className="font-bold">
                      {String(formData.grade).padStart(2, '0')}
                      {String(formData.class).padStart(2, '0')}
                      {String(formData.number).padStart(2, '0')}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* 비밀번호 변경 (선택사항) */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">비밀번호 변경 (선택)</h2>
              <p className="text-sm text-gray-600">비밀번호를 변경하지 않으려면 비워두세요.</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword || ''}
                    onChange={handleChange}
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 활성화 설정 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">활성화 설정</h2>

              {/* 활성화 여부 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  계정 활성화 (체크 해제 시 학생은 로그인할 수 없습니다)
                </label>
              </div>

              {/* 활성화 기간 (선택사항) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="activationStartDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    활성화 시작일 (선택)
                  </label>
                  <input
                    type="date"
                    id="activationStartDate"
                    name="activationStartDate"
                    value={formData.activationStartDate || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="activationEndDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    활성화 종료일 (선택)
                  </label>
                  <input
                    type="date"
                    id="activationEndDate"
                    name="activationEndDate"
                    value={formData.activationEndDate || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSaving ? '저장 중...' : '수정 완료'}
              </button>
              <Link
                href={`/teacher/students/${params.id}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                취소
              </Link>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}

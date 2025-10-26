'use client';

import { Card } from '@/components/ui';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StudentFormData {
  name: string;
  grade: number;
  class: number;
  number: number;
  password: string;
  confirmPassword: string;
  isActive: boolean;
  activationStartDate?: string;
  activationEndDate?: string;
}

export default function NewStudentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    grade: 1,
    class: 1,
    number: 1,
    password: '123456',
    confirmPassword: '123456',
    isActive: true,
  });

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

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 필수 필드 확인
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/teacher/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '학생 등록에 실패했습니다.');
      }

      // 성공 시 학생 목록으로 이동
      router.push('/teacher/students');
      router.refresh();
    } catch (err: any) {
      setError(err.message || '학생 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 자동 학번 생성 (예: 030201)
  const generatedStudentId = `${String(formData.grade).padStart(2, '0')}${String(
    formData.class
  ).padStart(2, '0')}${String(formData.number).padStart(2, '0')}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">학생 등록</h1>
        <p className="text-gray-600 mt-1">새로운 학생 정보를 등록하세요</p>
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

              {/* 자동 생성 학번 표시 */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">자동 생성 학번:</span>{' '}
                  <span className="text-indigo-600 font-bold text-lg">{generatedStudentId}</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  학번은 학년(2자리) + 반(2자리) + 번호(2자리)로 자동 생성됩니다.
                </p>
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">로그인 정보</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
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
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? '등록 중...' : '학생 등록'}
              </button>
              <Link
                href="/teacher/students"
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const teacherLoginSchema = z.object({
  teacherId: z.string().min(1, '교사 ID를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

const studentLoginSchema = z.object({
  studentId: z.string().min(6, '학번을 입력해주세요 (예: 030201)'),
  userId: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

type TeacherLoginFormData = z.infer<typeof teacherLoginSchema>;
type StudentLoginFormData = z.infer<typeof studentLoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'teacher' | 'student'>('student');
  const [clearingSession, setClearingSession] = useState(false);

  // 로그인 페이지 진입 시 기존 세션이 있으면 자동 로그아웃
  useEffect(() => {
    const clearExistingSession = async () => {
      if (status === 'authenticated' && session) {
        console.log('[Login] Clearing existing session before new login');
        setClearingSession(true);
        await signOut({ redirect: false });
        // 세션 완전히 클리어 후 페이지 리프레시
        router.refresh();
        setClearingSession(false);
      }
    };

    clearExistingSession();
  }, [status, session, router]);

  const teacherForm = useForm<TeacherLoginFormData>({
    resolver: zodResolver(teacherLoginSchema),
  });

  const studentForm = useForm<StudentLoginFormData>({
    resolver: zodResolver(studentLoginSchema),
  });

  const onTeacherSubmit = async (data: TeacherLoginFormData) => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        userId: data.teacherId,
        password: data.password,
        userType: 'teacher',
        redirect: false,
      });

      if (result?.error) {
        setError('교사 ID 또는 비밀번호가 올바르지 않습니다');
        setLoading(false);
        return;
      }

      router.push('/teacher/dashboard');
      router.refresh();
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다');
      setLoading(false);
    }
  };

  const onStudentSubmit = async (data: StudentLoginFormData) => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        userId: data.userId,
        password: data.password,
        studentId: data.studentId,
        userType: 'student',
        redirect: false,
      });

      if (result?.error) {
        setError('학번, 아이디 또는 비밀번호가 올바르지 않습니다');
        setLoading(false);
        return;
      }

      router.push('/student/dashboard');
      router.refresh();
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            <span className="text-purple-500">국어 학습</span> 시스템
          </h1>
          <p className="mt-2 text-gray-600 text-lg">로그인하여 시작하세요</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
          {/* User Type Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setUserType('student');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                userType === 'student'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              학생 로그인
            </button>
            <button
              onClick={() => {
                setUserType('teacher');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                userType === 'teacher'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              교사 로그인
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Student Login Form */}
          {userType === 'student' && (
            <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                  학번
                </label>
                <input
                  {...studentForm.register('studentId')}
                  type="text"
                  id="studentId"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예: 030201 (3학년 2반 1번)"
                />
                {studentForm.formState.errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">
                    {studentForm.formState.errors.studentId.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="student-userId" className="block text-sm font-medium text-gray-700 mb-2">
                  아이디
                </label>
                <input
                  {...studentForm.register('userId')}
                  type="text"
                  id="student-userId"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="아이디를 입력하세요"
                />
                {studentForm.formState.errors.userId && (
                  <p className="mt-1 text-sm text-red-600">
                    {studentForm.formState.errors.userId.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="student-password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  {...studentForm.register('password')}
                  type="password"
                  id="student-password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                {studentForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {studentForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || clearingSession}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium border-2 border-gray-900"
              >
                {clearingSession ? '세션 정리 중...' : loading ? '로그인 중...' : '학생 로그인'}
              </button>
            </form>
          )}

          {/* Teacher Login Form */}
          {userType === 'teacher' && (
            <form onSubmit={teacherForm.handleSubmit(onTeacherSubmit)} className="space-y-4">
              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-2">
                  교사 ID
                </label>
                <input
                  {...teacherForm.register('teacherId')}
                  type="text"
                  id="teacherId"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="교사 ID를 입력하세요"
                />
                {teacherForm.formState.errors.teacherId && (
                  <p className="mt-1 text-sm text-red-600">
                    {teacherForm.formState.errors.teacherId.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="teacher-password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  {...teacherForm.register('password')}
                  type="password"
                  id="teacher-password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                {teacherForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {teacherForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || clearingSession}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium border-2 border-gray-900"
              >
                {clearingSession ? '세션 정리 중...' : loading ? '로그인 중...' : '교사 로그인'}
              </button>
            </form>
          )}

          {/* Help Text */}
          <p className="mt-6 text-center text-sm text-gray-600">
            계정이 필요하신가요? 관리자에게 문의해주세요
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          국어 독해력 향상을 위한 학습 플랫폼
        </p>
      </div>
    </div>
  );
}

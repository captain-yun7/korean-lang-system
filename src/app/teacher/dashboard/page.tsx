import { Card } from '@/components/ui';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// 타입 정의
interface Stats {
  totalStudents: number;
  activeStudents: number;
  totalPassages: number;
  totalQuestions: number;
  averageScore: number;
}

interface Activity {
  id: string;
  studentName: string;
  action: string;
  passageTitle: string;
  score: number;
  time: string;
  createdAt: Date;
}

// 시간 차이를 "~분 전", "~시간 전" 형태로 변환
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  });
}

// 통계 데이터 가져오기
async function getStats(): Promise<Stats> {
  try {
    const [
      totalStudents,
      activeStudents,
      totalPassages,
      totalQuestions,
      averageScoreData,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { isActive: true } }),
      prisma.passage.count(),
      prisma.question.count(),
      prisma.result.aggregate({ _avg: { score: true } }),
    ]);

    return {
      totalStudents,
      activeStudents,
      totalPassages,
      totalQuestions,
      averageScore: averageScoreData._avg.score
        ? Math.round(averageScoreData._avg.score * 10) / 10
        : 0,
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return {
      totalStudents: 0,
      activeStudents: 0,
      totalPassages: 0,
      totalQuestions: 0,
      averageScore: 0,
    };
  }
}

// 최근 활동 데이터 가져오기
async function getRecentActivities(): Promise<Activity[]> {
  try {
    const recentResults = await prisma.result.findMany({
      take: 4,
      orderBy: { submittedAt: 'desc' },
      include: {
        student: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        passage: {
          select: { title: true },
        },
      },
    });

    return recentResults.map((result) => ({
      id: result.id,
      studentName: result.student.user.name,
      action: '지문 학습 완료',
      passageTitle: result.passage.title,
      score: result.score,
      time: getTimeAgo(result.submittedAt),
      createdAt: result.submittedAt,
    }));
  } catch (error) {
    console.error('Failed to fetch recent activities:', error);
    return [];
  }
}

export default async function TeacherDashboardPage() {
  // 인증 확인
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    redirect('/');
  }

  // 데이터 병렬로 가져오기
  const [stats, recentActivities] = await Promise.all([
    getStats(),
    getRecentActivities(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-1">실시간 학습 현황과 통계를 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <Card hover padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">전체 학생</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalStudents}
              </p>
              <p className="text-sm text-green-600 mt-1">
                활성: {stats.activeStudents}명
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Total Passages */}
        <Card hover padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">등록된 지문</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalPassages}
              </p>
              <Link href="/teacher/passages" className="text-sm text-indigo-600 hover:text-indigo-700 mt-1 inline-block">
                관리하기 →
              </Link>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Total Questions */}
        <Card hover padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">등록된 문제</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalQuestions}
              </p>
              <Link href="/teacher/questions" className="text-sm text-indigo-600 hover:text-indigo-700 mt-1 inline-block">
                관리하기 →
              </Link>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Average Score */}
        <Card hover padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 성적</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.averageScore > 0 ? `${stats.averageScore}점` : '-'}
              </p>
              <Link href="/teacher/stats" className="text-sm text-indigo-600 hover:text-indigo-700 mt-1 inline-block">
                통계 보기 →
              </Link>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card padding="none">
        <Card.Header className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">최근 활동</h2>
              <p className="text-sm text-gray-600 mt-1">학생들의 최근 학습 기록</p>
            </div>
            <Link
              href="/teacher/results"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              전체 보기 →
            </Link>
          </div>
        </Card.Header>
        <Card.Body className="px-6 pb-6">
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                      {activity.studentName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.studentName}</p>
                      <p className="text-sm text-gray-600">
                        {activity.action}: <span className="font-medium">{activity.passageTitle}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{activity.score}점</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        activity.score >= 90
                          ? 'bg-green-100 text-green-700'
                          : activity.score >= 80
                          ? 'bg-blue-100 text-blue-700'
                          : activity.score >= 70
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {activity.score >= 90
                        ? '우수'
                        : activity.score >= 80
                        ? '양호'
                        : activity.score >= 70
                        ? '보통'
                        : '미흡'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 학습 기록이 없습니다.
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/teacher/students" className="block">
          <Card hover padding="md" className="h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">학생 등록</h3>
              <p className="text-sm text-gray-600 mt-1">새로운 학생을 추가하세요</p>
            </div>
          </Card>
        </Link>

        <Link href="/teacher/passages" className="block">
          <Card hover padding="md" className="h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">지문 등록</h3>
              <p className="text-sm text-gray-600 mt-1">새로운 지문을 추가하세요</p>
            </div>
          </Card>
        </Link>

        <Link href="/teacher/questions" className="block">
          <Card hover padding="md" className="h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">문제 등록</h3>
              <p className="text-sm text-gray-600 mt-1">새로운 문제를 추가하세요</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

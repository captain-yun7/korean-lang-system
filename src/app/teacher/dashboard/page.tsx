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
  totalExams: number;
  averageScore: number;
}

interface Activity {
  id: string;
  studentName: string;
  action: string;
  examTitle: string;
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
      totalExams,
      averageScoreData,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { isActive: true } }),
      prisma.passage.count(),
      prisma.exam.count(),
      prisma.examResult.aggregate({ _avg: { score: true } }),
    ]);

    return {
      totalStudents,
      activeStudents,
      totalPassages,
      totalExams,
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
      totalExams: 0,
      averageScore: 0,
    };
  }
}

// 최근 활동 데이터 가져오기
async function getRecentActivities(): Promise<Activity[]> {
  try {
    const recentResults = await prisma.examResult.findMany({
      take: 4,
      orderBy: { submittedAt: 'desc' },
      include: {
        student: {
          select: {
            name: true,
          },
        },
        exam: {
          select: { title: true },
        },
      },
    });

    return recentResults.map((result) => ({
      id: result.id,
      studentName: result.student.name,
      action: '시험 응시 완료',
      examTitle: result.exam.title,
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
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">실시간 학습 현황과 통계를 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Students */}
        <Card hover padding="md" className="!p-3 sm:!p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">전체 학생</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {stats.totalStudents}
              </p>
              <p className="text-xs sm:text-sm text-green-600 mt-0.5 sm:mt-1">
                활성: {stats.activeStudents}명
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Total Passages */}
        <Card hover padding="md" className="!p-3 sm:!p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">등록된 지문</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {stats.totalPassages}
              </p>
              <Link href="/teacher/passages" className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 mt-0.5 sm:mt-1 inline-block">
                관리 →
              </Link>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Total Exams */}
        <Card hover padding="md" className="!p-3 sm:!p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">등록된 시험지</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {stats.totalExams}
              </p>
              <Link href="/teacher/exams" className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 mt-0.5 sm:mt-1 inline-block">
                관리 →
              </Link>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Average Score */}
        <Card hover padding="md" className="!p-3 sm:!p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">평균 성적</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {stats.averageScore > 0 ? `${stats.averageScore}점` : '-'}
              </p>
              <Link href="/teacher/stats" className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 mt-0.5 sm:mt-1 inline-block">
                통계 →
              </Link>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card padding="none">
        <Card.Header className="px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">최근 활동</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">학생들의 최근 학습 기록</p>
            </div>
            <Link
              href="/teacher/results"
              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              전체 →
            </Link>
          </div>
        </Card.Header>
        <Card.Body className="px-4 sm:px-6 pb-4 sm:pb-6">
          {recentActivities.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3"
                >
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-sm sm:text-base flex-shrink-0">
                      {activity.studentName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{activity.studentName}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        <span className="hidden sm:inline">{activity.action}: </span>
                        <span className="font-medium">{activity.examTitle}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-base sm:text-lg font-bold text-gray-900">{activity.score}점</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <div
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium hidden sm:block ${
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
            <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
              아직 시험 응시 기록이 없습니다.
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Link href="/teacher/students" className="block">
          <Card hover padding="md" className="h-full !p-3 sm:!p-4">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-xs sm:text-base">학생 등록</h3>
              <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">새 학생 추가</p>
            </div>
          </Card>
        </Link>

        <Link href="/teacher/passages" className="block">
          <Card hover padding="md" className="h-full !p-3 sm:!p-4">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-xs sm:text-base">지문 등록</h3>
              <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">새 지문 추가</p>
            </div>
          </Card>
        </Link>

        <Link href="/teacher/exams/new" className="block">
          <Card hover padding="md" className="h-full !p-3 sm:!p-4">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-xs sm:text-base">시험지 등록</h3>
              <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">새 시험지 추가</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

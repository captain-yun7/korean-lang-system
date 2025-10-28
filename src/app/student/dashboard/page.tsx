import { Card } from '@/components/ui';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  FireIcon,
  StarIcon,
  ChartBarIcon,
  LightBulbIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  XCircleIcon,
  TrophyIcon,
  DocumentTextIcon
} from '@heroicons/react/24/solid';

// 학생 통계 가져오기
async function getStudentStats(studentId: string) {
  try {
    // 학생 정보 조회
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        results: {
          orderBy: { submittedAt: 'desc' },
          take: 5,
          include: {
            passage: {
              select: {
                id: true,
                title: true,
                category: true,
                subcategory: true,
              },
            },
          },
        },
      },
    });

    if (!student) return null;

    // 전체 통계 계산
    const totalResults = await prisma.result.count({
      where: { studentId },
    });

    const avgScoreData = await prisma.result.aggregate({
      where: { studentId },
      _avg: {
        score: true,
      },
    });

    const totalReadingTime = await prisma.result.aggregate({
      where: { studentId },
      _sum: {
        readingTime: true,
      },
    });

    // 지정된 학습 (미완료) - 추후 구현
    const assignedCount = 0;

    return {
      student,
      totalResults,
      averageScore: avgScoreData._avg.score
        ? Math.round(avgScoreData._avg.score * 10) / 10
        : 0,
      totalReadingTime: totalReadingTime._sum.readingTime || 0,
      assignedCount,
      recentResults: student.results,
    };
  } catch (error) {
    console.error('Failed to fetch student stats:', error);
    return null;
  }
}

export default async function StudentDashboardPage() {
  // 인증 확인
  const session = await auth();
  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/');
  }

  const studentId = session.user.id;

  // 학생 ID로 student 레코드 찾기
  const student = await prisma.student.findFirst({
    where: { userId: studentId },
  });

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">학생 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const stats = await getStudentStats(student.id);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">학습 현황을 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 점수에 따른 메시지와 아이콘
  const getScoreMessage = (score: number) => {
    if (score >= 90) return { Icon: FireIcon, message: '정말 대단해요!', color: 'text-purple-600' };
    if (score >= 80) return { Icon: StarIcon, message: '훌륭해요!', color: 'text-purple-500' };
    if (score >= 70) return { Icon: ChartBarIcon, message: '잘하고 있어요!', color: 'text-purple-600' };
    if (score >= 60) return { Icon: ChartBarIcon, message: '계속 노력해요!', color: 'text-purple-500' };
    return { Icon: LightBulbIcon, message: '화이팅!', color: 'text-purple-600' };
  };

  const scoreInfo = getScoreMessage(stats.averageScore);
  const ScoreIcon = scoreInfo.Icon;

  return (
    <div className="space-y-20 pb-16 mt-8">
      {/* Page Header */}
      <div className="relative rounded-lg bg-white p-8 border-2 border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900">
          안녕하세요, {session.user.name}님!
        </h1>
        <p className="text-gray-600 text-lg mt-2">
          {stats.student.grade}학년 {stats.student.class}반 {stats.student.number}번 · 오늘도 열심히 공부해봐요!
        </p>
      </div>

      {/* 학습 현황 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
        {/* 평균 점수 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
          <div className="relative bg-white rounded-lg p-6 m-1 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <ScoreIcon className={`w-10 h-10 ${scoreInfo.color}`} />
              <div className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                {scoreInfo.message}
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">평균 점수</p>
            <p className="text-5xl font-black text-gray-900 mb-2">
              {stats.averageScore}
              <span className="text-2xl ml-1 text-gray-700">점</span>
            </p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all"
                style={{ width: `${stats.averageScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 학습 횟수 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
          <div className="relative bg-white rounded-lg p-6 m-1 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <CheckCircleIcon className="w-10 h-10 text-purple-500" />
              <div className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                누적 학습
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">학습 횟수</p>
            <p className="text-5xl font-black text-gray-900">
              {stats.totalResults}
              <span className="text-2xl ml-1 text-gray-700">회</span>
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {stats.totalResults > 0 ? '꾸준히 하고 있어요' : '첫 학습을 시작해보세요'}
            </p>
          </div>
        </div>

        {/* 총 독해 시간 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
          <div className="relative bg-white rounded-lg p-6 m-1 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="w-10 h-10 text-purple-500" />
              <div className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                집중 시간
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">총 독해 시간</p>
            <p className="text-5xl font-black text-gray-900">
              {Math.floor(stats.totalReadingTime / 60)}
              <span className="text-2xl ml-1 text-gray-700">분</span>
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {stats.totalReadingTime > 0 ? `${Math.floor(stats.totalReadingTime / 3600)}시간 ${Math.floor((stats.totalReadingTime % 3600) / 60)}분` : '시작이 반이에요'}
            </p>
          </div>
        </div>

        {/* 과제 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-purple-500 rounded-lg transform group-hover:scale-105 transition-transform"></div>
          <div className="relative bg-white rounded-lg p-6 m-1 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <DocumentTextIcon className="w-10 h-10 text-purple-500" />
              <div className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                미완료
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">과제</p>
            <p className="text-5xl font-black text-gray-900">
              {stats.assignedCount}
              <span className="text-2xl ml-1 text-gray-700">개</span>
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {stats.assignedCount > 0 ? '얼른 완료하세요' : '과제가 없어요'}
            </p>
          </div>
        </div>
      </div>

      {/* 빠른 시작 */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-10">빠른 시작</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Link href="/student/study" className="group">
            <div className="rounded-lg bg-purple-500 p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-gray-900">
              <BookOpenIcon className="w-12 h-12 mb-3" />
              <h3 className="text-xl font-bold mb-2">학습하기</h3>
              <p className="text-sm text-white/90">
                스스로, 문법 학습 선택
              </p>
            </div>
          </Link>

          <Link href="/student/study/assigned" className="group">
            <div className="rounded-lg bg-purple-500 p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-gray-900">
              <AcademicCapIcon className="w-12 h-12 mb-3" />
              <h3 className="text-xl font-bold mb-2">교사 지정</h3>
              <p className="text-sm text-white/90">
                선생님 배정 과제
              </p>
            </div>
          </Link>

          <Link href="/student/results" className="group">
            <div className="rounded-lg bg-purple-500 p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-gray-900">
              <ChartBarIcon className="w-12 h-12 mb-3" />
              <h3 className="text-xl font-bold mb-2">내 성적</h3>
              <p className="text-sm text-white/90">
                학습 기록 확인
              </p>
            </div>
          </Link>

          <Link href="/student/wrong-answers" className="group">
            <div className="rounded-lg bg-purple-500 p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-gray-900">
              <XCircleIcon className="w-12 h-12 mb-3" />
              <h3 className="text-xl font-bold mb-2">오답 노트</h3>
              <p className="text-sm text-white/90">
                틀린 문제 복습
              </p>
            </div>
          </Link>

          <Link href="/student/ranking" className="group">
            <div className="rounded-lg bg-purple-500 p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-gray-900">
              <TrophyIcon className="w-12 h-12 mb-3" />
              <h3 className="text-xl font-bold mb-2">순위</h3>
              <p className="text-sm text-white/90">
                반, 학년 순위
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 최근 학습 기록 */}
      {stats.recentResults.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">최근 학습 기록</h2>
              <Link
                href="/student/results"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                전체 보기
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentResults.map((result, index) => (
              <Link
                key={result.id}
                href={`/student/results/${result.id}`}
                className="block p-6 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                        {result.passage.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                          {result.passage.category}
                        </span>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                          {result.passage.subcategory}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(result.submittedAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <div className={`text-4xl font-black ${
                        result.score >= 90 ? 'text-red-500' :
                        result.score >= 80 ? 'text-orange-500' :
                        result.score >= 70 ? 'text-green-500' :
                        result.score >= 60 ? 'text-blue-500' : 'text-gray-500'
                      }`}>
                        {result.score}
                      </div>
                      <span className="text-lg text-gray-500">점</span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                      <ClockIcon className="w-3 h-3" />
                      {Math.floor(result.readingTime / 60)}분 {result.readingTime % 60}초
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 학습이 없는 경우 */}
      {stats.recentResults.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-12 text-center">
          <BookOpenIcon className="w-24 h-24 mx-auto mb-6 text-indigo-300" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            아직 학습 기록이 없습니다
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            첫 학습을 시작하고 실력을 향상시켜보세요
          </p>
          <Link
            href="/student/study"
            className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            학습 시작하기
          </Link>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
        </div>
      )}
    </div>
  );
}

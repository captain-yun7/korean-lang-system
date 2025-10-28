import { Card } from '@/components/ui';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          안녕하세요, {session.user.name}님!
        </h1>
        <p className="text-gray-600 mt-1">
          {stats.student.grade}학년 {stats.student.class}반 {stats.student.number}번
        </p>
      </div>

      {/* 지정된 학습 알림 */}
      {stats.assignedCount > 0 && (
        <Card>
          <Card.Body className="p-4 bg-indigo-50 border-l-4 border-indigo-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-indigo-900">
                  완료해야 할 학습이 {stats.assignedCount}개 있습니다
                </h3>
                <p className="text-sm text-indigo-700 mt-1">
                  교사가 지정한 학습을 완료하세요
                </p>
              </div>
              <Link
                href="/student/study/assigned"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                바로가기
              </Link>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* 학습 현황 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">평균 점수</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {stats.averageScore}점
              </p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">학습 횟수</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalResults}회
              </p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">총 독해 시간</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {Math.floor(stats.totalReadingTime / 60)}분
              </p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">완료해야 할 학습</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {stats.assignedCount}개
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* 빠른 시작 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 시작</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Link href="/student/study/self">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Card.Body className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="text-lg font-semibold text-gray-900">스스로 학습</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    원하는 지문을 선택하여 학습하세요
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Link>

          <Link href="/student/study/assigned">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Card.Body className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">👨‍🏫</div>
                  <h3 className="text-lg font-semibold text-gray-900">교사 지정 학습</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    선생님이 배정한 과제를 완료하세요
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Link>

          <Link href="/student/results">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Card.Body className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="text-lg font-semibold text-gray-900">내 성적</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    학습 기록과 성적을 확인하세요
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Link>

          <Link href="/student/wrong-answers">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Card.Body className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="text-lg font-semibold text-gray-900">오답 노트</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    틀린 문제를 다시 풀어보세요
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Link>

          <Link href="/student/ranking">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Card.Body className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🏆</div>
                  <h3 className="text-lg font-semibold text-gray-900">순위</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    반, 학년, 전체 순위를 확인하세요
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </div>
      </div>

      {/* 최근 학습 기록 */}
      {stats.recentResults.length > 0 && (
        <Card>
          <Card.Header className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">최근 학습 기록</h2>
              <Link
                href="/student/results"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                전체 보기
              </Link>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="divide-y divide-gray-200">
              {stats.recentResults.map((result) => (
                <Link
                  key={result.id}
                  href={`/student/results/${result.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {result.passage.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {result.passage.category} · {result.passage.subcategory}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(result.submittedAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-indigo-600">
                        {result.score}점
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.floor(result.readingTime / 60)}분 {result.readingTime % 60}초
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* 학습이 없는 경우 */}
      {stats.recentResults.length === 0 && (
        <Card>
          <Card.Body className="p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900">
              아직 학습 기록이 없습니다
            </h3>
            <p className="text-gray-600 mt-2 mb-6">
              첫 학습을 시작하고 실력을 향상시켜보세요!
            </p>
            <Link
              href="/student/study/self"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              학습 시작하기
            </Link>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

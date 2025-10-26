import { Card } from '@/components/ui';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// 학생 상세 정보 가져오기
async function getStudentDetail(id: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        results: {
          orderBy: { submittedAt: 'desc' },
          take: 10,
          include: {
            passage: {
              select: {
                title: true,
                category: true,
                subcategory: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return null;
    }

    // 학습 통계 계산
    const stats = {
      totalResults: student.results.length,
      averageScore: student.results.length > 0
        ? Math.round(
            (student.results.reduce((sum, r) => sum + r.score, 0) /
              student.results.length) *
              10
          ) / 10
        : 0,
      totalReadingTime: student.results.reduce((sum, r) => sum + r.readingTime, 0),
    };

    return { student, stats };
  } catch (error) {
    console.error('Failed to fetch student detail:', error);
    return null;
  }
}

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // 인증 확인
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    redirect('/');
  }

  const data = await getStudentDetail(params.id);

  if (!data) {
    notFound();
  }

  const { student, stats } = data;

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
          <Link
            href={`/teacher/students/${student.id}/edit`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            정보 수정
          </Link>
          <Link
            href="/teacher/students"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            목록으로
          </Link>
        </div>
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {Math.floor(stats.totalReadingTime / 60)}분
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

      {/* Recent Learning History */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">최근 학습 기록</h2>
            <Link
              href={`/teacher/students/${student.id}/results`}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              전체 보기 →
            </Link>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {student.results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      점수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      독해 시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제출일
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {student.results.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {result.passage.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.passage.category} · {result.passage.subcategory}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{result.score}점</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Math.floor(result.readingTime / 60)}분 {result.readingTime % 60}초
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(result.submittedAt).toLocaleDateString('ko-KR')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">아직 학습 기록이 없습니다.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

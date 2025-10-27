import { Card } from '@/components/ui';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

interface ContentBlock {
  para: string;
  q: string;
  a: string;
  explanation: string;
}

// 지문 상세 정보 가져오기
async function getPassageDetail(id: string) {
  try {
    const passage = await prisma.passage.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { createdAt: 'desc' },
        },
        results: {
          orderBy: { submittedAt: 'desc' },
          take: 10,
          include: {
            student: {
              select: {
                name: true,
                studentId: true,
              },
            },
          },
        },
        _count: {
          select: {
            questions: true,
            results: true,
          },
        },
      },
    });

    if (!passage) {
      return null;
    }

    return passage;
  } catch (error) {
    console.error('Failed to fetch passage detail:', error);
    return null;
  }
}

export default async function PassageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 인증 확인
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    redirect('/');
  }

  const passage = await getPassageDetail(id);

  if (!passage) {
    notFound();
  }

  const contentBlocks = passage.contentBlocks as ContentBlock[];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{passage.title}</h1>
          <p className="text-gray-600 mt-1">
            {passage.category} · {passage.subcategory} · {passage.difficulty}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/teacher/passages/${passage.id}/edit`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            수정
          </Link>
          <Link
            href="/teacher/passages"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            목록으로
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">문단 수</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {contentBlocks.length}개
              </p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">문제 수</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {passage._count.questions}개
              </p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">학습 횟수</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {passage._count.results}회
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Content Blocks */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">지문 내용</h2>
        </Card.Header>
        <Card.Body className="p-6">
          <div className="space-y-6">
            {contentBlocks.map((block, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">문단 {index + 1}</h3>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">내용</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{block.para}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">질문</p>
                  <p className="text-gray-900">{block.q}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">모범 답안</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{block.a}</p>
                </div>

                {block.explanation && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">해설</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{block.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Questions */}
      {passage.questions.length > 0 && (
        <Card>
          <Card.Header className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                연결된 문제 ({passage.questions.length}개)
              </h2>
              <Link
                href={`/teacher/questions/new?passageId=${passage.id}`}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + 문제 추가
              </Link>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="divide-y divide-gray-200">
              {passage.questions.map((question) => (
                <div key={question.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                        {question.type}
                      </span>
                      <p className="text-gray-900 mt-2">{question.text}</p>
                    </div>
                    <Link
                      href={`/teacher/questions/${question.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-700 ml-4"
                    >
                      상세
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Recent Results */}
      {passage.results.length > 0 && (
        <Card>
          <Card.Header className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">최근 학습 기록</h2>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      학생
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
                  {passage.results.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.student.name} ({result.student.studentId})
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
          </Card.Body>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">메타 정보</h2>
        </Card.Header>
        <Card.Body className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-600">등록일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(passage.createdAt).toLocaleString('ko-KR')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">최종 수정일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(passage.updatedAt).toLocaleString('ko-KR')}
              </dd>
            </div>
          </dl>
        </Card.Body>
      </Card>
    </div>
  );
}

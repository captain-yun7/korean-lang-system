import { Card } from '@/components/ui';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// 타입 정의
interface PassageListItem {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  difficulty: string;
  createdAt: Date;
  _count: {
    questions: number;
    results: number;
  };
}

interface SearchParams {
  category?: string;
  subcategory?: string;
  difficulty?: string;
  search?: string;
}

// 카테고리 및 서브카테고리 정의
const CATEGORIES = {
  비문학: ['인문예술', '과학기술', '사회문화'],
  문학: ['고전산문', '고전시가', '현대산문', '현대시'],
  문법: ['품사', '단어의 형성', '음운 변동', '문장', '한글맞춤법', '중세 국어'],
};

const DIFFICULTIES = ['중학교', '고1-2', '고3'];

// 지문 목록 가져오기
async function getPassages(params: SearchParams): Promise<PassageListItem[]> {
  try {
    const where: any = {};

    // 카테고리 필터
    if (params.category) {
      where.category = params.category;
    }

    // 서브카테고리 필터
    if (params.subcategory) {
      where.subcategory = params.subcategory;
    }

    // 난이도 필터
    if (params.difficulty) {
      where.difficulty = params.difficulty;
    }

    // 검색어 필터 (제목)
    if (params.search) {
      where.title = { contains: params.search };
    }

    const passages = await prisma.passage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        subcategory: true,
        difficulty: true,
        createdAt: true,
        _count: {
          select: {
            questions: true,
            results: true,
          },
        },
      },
    });

    return passages;
  } catch (error) {
    console.error('Failed to fetch passages:', error);
    return [];
  }
}

export default async function PassagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // 인증 확인
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    redirect('/');
  }

  const passages = await getPassages(searchParams);

  // 선택된 카테고리에 따른 서브카테고리 목록
  const subcategories = searchParams.category
    ? CATEGORIES[searchParams.category as keyof typeof CATEGORIES] || []
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">지문 관리</h1>
          <p className="text-gray-600 mt-1">학습 지문을 관리하고 문제를 출제하세요</p>
        </div>
        <Link
          href="/teacher/passages/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          + 지문 등록
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <Card.Body className="p-6">
          <form className="flex gap-4 flex-wrap">
            {/* 카테고리 필터 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <select
                id="category"
                name="category"
                defaultValue={searchParams.category || ''}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">전체</option>
                {Object.keys(CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 서브카테고리 필터 */}
            <div>
              <label
                htmlFor="subcategory"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                세부 분류
              </label>
              <select
                id="subcategory"
                name="subcategory"
                defaultValue={searchParams.subcategory || ''}
                disabled={!searchParams.category}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">전체</option>
                {subcategories.map((subcat) => (
                  <option key={subcat} value={subcat}>
                    {subcat}
                  </option>
                ))}
              </select>
            </div>

            {/* 난이도 필터 */}
            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                난이도
              </label>
              <select
                id="difficulty"
                name="difficulty"
                defaultValue={searchParams.difficulty || ''}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">전체</option>
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>

            {/* 검색 */}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                검색
              </label>
              <input
                type="text"
                id="search"
                name="search"
                defaultValue={searchParams.search || ''}
                placeholder="제목 검색"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 버튼 */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                필터 적용
              </button>
              <Link
                href="/teacher/passages"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                초기화
              </Link>
            </div>
          </form>
        </Card.Body>
      </Card>

      {/* Passages Table */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              지문 목록 ({passages.length}개)
            </h2>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {passages.length > 0 ? (
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
                      난이도
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      문제 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      학습 횟수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      등록일
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {passages.map((passage) => (
                    <tr key={passage.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {passage.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {passage.category}
                          <span className="text-gray-400 mx-1">·</span>
                          {passage.subcategory}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {passage.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {passage._count.questions}개
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {passage._count.results}회
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(passage.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/teacher/passages/${passage.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          상세
                        </Link>
                        <Link
                          href={`/teacher/passages/${passage.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          수정
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">등록된 지문이 없습니다.</p>
              <p className="text-sm mt-2">지문을 등록하여 학습을 시작하세요.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

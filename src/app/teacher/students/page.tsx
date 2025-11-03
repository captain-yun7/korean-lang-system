import { Card } from '@/components/ui';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// 타입 정의
interface StudentListItem {
  id: string;
  studentId: string;
  name: string;
  schoolLevel: string;
  grade: number;
  class: number;
  number: number;
  isActive: boolean;
  activationStartDate: Date | null;
  activationEndDate: Date | null;
}

interface SearchParams {
  schoolLevel?: string;
  grade?: string;
  class?: string;
  status?: string;
  search?: string;
}

// 학생 목록 가져오기
async function getStudents(params: SearchParams): Promise<StudentListItem[]> {
  try {
    const where: any = {};

    // 학교급 필터
    if (params.schoolLevel) {
      where.schoolLevel = params.schoolLevel;
    }

    // 학년 필터
    if (params.grade) {
      where.grade = parseInt(params.grade);
    }

    // 반 필터
    if (params.class) {
      where.class = parseInt(params.class);
    }

    // 활성화 상태 필터
    if (params.status === 'active') {
      where.isActive = true;
    } else if (params.status === 'inactive') {
      where.isActive = false;
    }

    // 검색어 필터 (이름 또는 학번)
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { studentId: { contains: params.search } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: [
        { schoolLevel: 'asc' },
        { grade: 'asc' },
        { class: 'asc' },
        { number: 'asc' },
      ],
      select: {
        id: true,
        studentId: true,
        name: true,
        schoolLevel: true,
        grade: true,
        class: true,
        number: true,
        isActive: true,
        activationStartDate: true,
        activationEndDate: true,
      },
    });

    return students;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return [];
  }
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // 인증 확인
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    redirect('/');
  }

  const students = await getStudents(searchParams);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학생 관리</h1>
          <p className="text-gray-600 mt-1">학생 정보를 관리하고 학습 현황을 확인하세요</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/teacher/students/import"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            일괄 등록
          </Link>
          <Link
            href="/teacher/students/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            + 학생 등록
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <Card.Body className="p-6">
          <form className="flex gap-4 flex-wrap">
            {/* 학교급 필터 */}
            <div>
              <label htmlFor="schoolLevel" className="block text-sm font-medium text-gray-700 mb-1">
                학교급
              </label>
              <select
                id="schoolLevel"
                name="schoolLevel"
                defaultValue={searchParams.schoolLevel || ''}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">전체</option>
                <option value="중등">중등</option>
                <option value="고등">고등</option>
              </select>
            </div>

            {/* 학년 필터 */}
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                학년
              </label>
              <select
                id="grade"
                name="grade"
                defaultValue={searchParams.grade || ''}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">전체</option>
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
              </select>
            </div>

            {/* 반 필터 */}
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                반
              </label>
              <select
                id="class"
                name="class"
                defaultValue={searchParams.class || ''}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">전체</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num}반
                  </option>
                ))}
              </select>
            </div>

            {/* 상태 필터 */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <select
                id="status"
                name="status"
                defaultValue={searchParams.status || ''}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">전체</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
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
                placeholder="이름 또는 학번 검색"
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
                href="/teacher/students"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                초기화
              </Link>
            </div>
          </form>
        </Card.Body>
      </Card>

      {/* Students Table */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              학생 목록 ({students.length}명)
            </h2>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      학번
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      학교급
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      학년/반/번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      활성화 기간
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.studentId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.schoolLevel}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.grade}학년 {student.class}반 {student.number}번
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            student.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {student.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.activationStartDate && student.activationEndDate ? (
                            <>
                              {new Date(student.activationStartDate).toLocaleDateString('ko-KR')} ~{' '}
                              {new Date(student.activationEndDate).toLocaleDateString('ko-KR')}
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/teacher/students/${student.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          상세
                        </Link>
                        <Link
                          href={`/teacher/students/${student.id}/edit`}
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
              <p className="text-lg">등록된 학생이 없습니다.</p>
              <p className="text-sm mt-2">학생을 등록하여 학습을 시작하세요.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

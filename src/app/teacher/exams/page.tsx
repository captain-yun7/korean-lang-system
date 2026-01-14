'use client';

import { Card, Button } from '@/components/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ExamPaper {
  id: string;
  title: string;
  category: string;
  examType: string;
  targetGrade: number;
  targetClass: number | null;
  createdAt: string;
  _count: {
    examResults: number;
    assignedExams: number;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ExamPapersPage() {
  const [examPapers, setExamPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [examType, setExamType] = useState('');
  const [targetGrade, setTargetGrade] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  useEffect(() => {
    fetchExamPapers();
  }, [search, category, examType, targetGrade, page]);

  // 필터 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setPage(1);
  }, [search, category, examType, targetGrade]);

  const fetchExamPapers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (examType) params.append('examType', examType);
      if (targetGrade) params.append('targetGrade', targetGrade);
      params.append('page', page.toString());
      params.append('limit', '10');

      const response = await fetch(`/api/teacher/exams?${params}`);
      const data = await response.json();

      if (response.ok) {
        setExamPapers(data.examPapers);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching exam papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `"${title}" 시험지를 삭제하시겠습니까?\n\n연결된 배정 및 학습 결과도 함께 삭제됩니다.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/exams/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      alert('시험지가 삭제되었습니다.');
      fetchExamPapers();
    } catch (error) {
      alert('시험지 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">시험지 관리</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">시험지를 관리하고 학생들에게 배정하세요</p>
        </div>
        <Link href="/teacher/exams/new">
          <Button variant="primary" className="text-sm sm:text-base">+ 시험지 등록</Button>
        </Link>
      </div>

      {/* 필터 */}
      <Card padding="md" className="!p-3 sm:!p-4">
        {/* 모바일 필터 토글 */}
        <div className="flex items-center justify-between sm:hidden mb-3">
          <span className="text-sm font-medium text-gray-700">필터</span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-indigo-600 font-medium"
          >
            {showFilters ? '접기' : '펼치기'}
          </button>
        </div>

        {/* 검색 - 항상 표시 */}
        <div className="mb-3 sm:mb-0">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="시험지 제목 검색..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        {/* 필터들 - 모바일에서는 토글 */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 ${showFilters ? 'block' : 'hidden sm:grid'}`}>
          {/* 영역 필터 */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              영역
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">전체</option>
              <option value="비문학">비문학</option>
              <option value="문학">문학</option>
              <option value="문법">문법</option>
              <option value="어휘">어휘</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 시험지 타입 필터 */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              타입
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">전체</option>
              <option value="ASSIGNED">배정용</option>
              <option value="SELF_STUDY">자습용</option>
            </select>
          </div>

          {/* 학년 필터 */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              학년
            </label>
            <select
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">전체</option>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 시험지 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : examPapers.length === 0 ? (
        <Card padding="lg" className="!p-6 sm:!p-8">
          <div className="text-center py-6 sm:py-12">
            <p className="text-gray-500 mb-4 text-sm sm:text-base">등록된 시험지가 없습니다.</p>
            <Link href="/teacher/exams/new">
              <Button variant="primary" className="text-sm sm:text-base">+ 첫 시험지 등록하기</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* 시험지 개수 표시 */}
          {pagination && (
            <div className="text-sm text-gray-600">
              전체 {pagination.total}개 중 {(page - 1) * pagination.limit + 1}-{Math.min(page * pagination.limit, pagination.total)}개 표시
            </div>
          )}

          <div className="grid gap-3 sm:gap-4">
            {examPapers.map((examPaper) => (
              <Card key={examPaper.id} padding="md" hover className="!p-3 sm:!p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/teacher/exams/${examPaper.id}`}
                      className="group"
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {examPaper.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-600 flex-wrap">
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded">
                        {examPaper.category}
                      </span>
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${
                        examPaper.examType === 'SELF_STUDY'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {examPaper.examType === 'SELF_STUDY' ? '자습용' : '배정용'}
                      </span>
                      <span>{examPaper.targetGrade}학년</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                      <span>배정: {examPaper._count.assignedExams}건</span>
                      <span>완료: {examPaper._count.examResults}건</span>
                      <span className="hidden sm:inline">
                        {new Date(examPaper.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-4 justify-end sm:justify-start">
                    <Link href={`/teacher/exams/${examPaper.id}`}>
                      <Button variant="secondary" size="sm" className="text-xs sm:text-sm !px-2 sm:!px-3 !py-1 sm:!py-1.5">
                        상세
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(examPaper.id, examPaper.title)}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 페이지네이션 */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-2 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                처음
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    // 현재 페이지 주변 2페이지만 표시
                    return Math.abs(p - page) <= 2 || p === 1 || p === pagination.totalPages;
                  })
                  .map((p, idx, arr) => {
                    // 생략 표시 추가
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <span key={p} className="flex items-center">
                        {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 text-sm rounded-md ${
                            p === page
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    );
                  })}
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="px-3 py-2 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
              <button
                onClick={() => setPage(pagination.totalPages)}
                disabled={page === pagination.totalPages}
                className="px-3 py-2 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                마지막
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';

interface Question {
  id: string;
  type: string;
  text: string;
  answers: string[];
  passage: {
    id: string;
    title: string;
    category: string;
    subcategory: string;
  } | null;
  _count: {
    questionAnswers: number;
  };
  createdAt: string;
}

interface Passage {
  id: string;
  title: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // 필터 상태
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    passageId: '',
  });

  // 문제 목록 조회
  useEffect(() => {
    fetchQuestions();
  }, [currentPage, filters]);

  // 지문 목록 조회 (필터용)
  useEffect(() => {
    fetchPassages();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.passageId && { passageId: filters.passageId }),
      });

      const res = await fetch(`/api/teacher/questions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch questions');

      const data = await res.json();
      setQuestions(data.questions);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error:', error);
      alert('문제 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPassages = async () => {
    try {
      const res = await fetch('/api/teacher/passages?limit=100');
      if (!res.ok) throw new Error('Failed to fetch passages');

      const data = await res.json();
      setPassages(data.passages);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 문제를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/teacher/questions/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete question');

      alert('문제가 삭제되었습니다.');
      fetchQuestions();
    } catch (error) {
      console.error('Error:', error);
      alert('문제 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">문제 관리</h1>
          <p className="text-gray-600 mt-1">
            학습 문제를 등록하고 관리하세요
          </p>
        </div>
        <Link href="/teacher/questions/new">
          <Button variant="primary">+ 문제 등록</Button>
        </Link>
      </div>

      {/* 필터 */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <input
              type="text"
              placeholder="문제 내용 검색"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* 문제 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              문제 유형
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">전체</option>
              <option value="객관식">객관식</option>
              <option value="단답형">단답형</option>
              <option value="서술형">서술형</option>
            </select>
          </div>

          {/* 지문 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연결된 지문
            </label>
            <select
              value={filters.passageId}
              onChange={(e) => handleFilterChange('passageId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">전체</option>
              <option value="null">독립 문제</option>
              {passages.map((passage) => (
                <option key={passage.id} value={passage.id}>
                  {passage.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 문제 목록 */}
      <Card padding="none">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">등록된 문제가 없습니다.</p>
            <Link href="/teacher/questions/new" className="mt-4 inline-block">
              <Button variant="primary">첫 문제 등록하기</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      문제 내용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연결된 지문
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      답변 수
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
                  {questions.map((question) => (
                    <tr key={question.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2">
                          {question.text}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          정답: {question.answers.join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            question.type === '객관식'
                              ? 'bg-blue-100 text-blue-800'
                              : question.type === '단답형'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {question.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {question.passage ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {question.passage.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {question.passage.category} /{' '}
                              {question.passage.subcategory}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            독립 문제
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {question._count.questionAnswers}회
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          href={`/teacher/questions/${question.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          상세
                        </Link>
                        <Link
                          href={`/teacher/questions/${question.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

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

export default function ExamPapersPage() {
  const [examPapers, setExamPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [examType, setExamType] = useState('');
  const [targetGrade, setTargetGrade] = useState('');

  useEffect(() => {
    fetchExamPapers();
  }, [search, category, examType, targetGrade]);

  const fetchExamPapers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (examType) params.append('examType', examType);
      if (targetGrade) params.append('targetGrade', targetGrade);

      const response = await fetch(`/api/teacher/exams?${params}`);
      const data = await response.json();

      if (response.ok) {
        setExamPapers(data.examPapers);
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
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시험지 관리</h1>
          <p className="text-gray-600 mt-1">시험지를 관리하고 학생들에게 배정하세요</p>
        </div>
        <Link href="/teacher/exams/new">
          <Button variant="primary">+ 시험지 등록</Button>
        </Link>
      </div>

      {/* 필터 */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="시험지 제목 검색"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* 영역 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              영역
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              타입
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">전체</option>
              <option value="ASSIGNED">배정용</option>
              <option value="SELF_STUDY">자습용</option>
            </select>
          </div>

          {/* 학년 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              학년
            </label>
            <select
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
        <Card padding="lg">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">등록된 시험지가 없습니다.</p>
            <Link href="/teacher/exams/new">
              <Button variant="primary">+ 첫 시험지 등록하기</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {examPapers.map((examPaper) => (
            <Card key={examPaper.id} padding="md" hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={`/teacher/exams/${examPaper.id}`}
                    className="group"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {examPaper.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {examPaper.category}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      examPaper.examType === 'SELF_STUDY'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {examPaper.examType === 'SELF_STUDY' ? '자습용' : '배정용'}
                    </span>
                    <span>{examPaper.targetGrade}학년</span>
                    <span>•</span>
                    <span>
                      {new Date(examPaper.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>배정: {examPaper._count.assignedExams}건</span>
                    <span>완료: {examPaper._count.examResults}건</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/teacher/exams/${examPaper.id}`}>
                    <Button variant="secondary" size="sm">
                      상세보기
                    </Button>
                  </Link>
                  <button
                    onClick={() => handleDelete(examPaper.id, examPaper.title)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

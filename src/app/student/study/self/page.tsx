'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';
import { BookOpenIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

// 카테고리
const CATEGORIES = ['전체', '비문학', '문학'];

interface Exam {
  id: string;
  title: string;
  category: string;
  targetSchool: string;
  targetGrade: number;
  createdAt: string;
  _count: {
    examResults: number;
  };
}

export default function SelfStudyPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  useEffect(() => {
    fetchExams();
  }, [selectedCategory]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('examType', 'SELF_STUDY');
      params.append('isPublic', 'true');
      if (selectedCategory && selectedCategory !== '전체') {
        params.append('category', selectedCategory);
      }

      const res = await fetch(`/api/student/exams/self-study?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch exams');

      const data = await res.json();
      setExams(data.exams);
    } catch (error) {
      console.error('Error:', error);
      alert('시험지 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리별로 시험지 분류
  const categorizedExams = {
    비문학: exams.filter((exam) => exam.category === '비문학'),
    문학: exams.filter((exam) => exam.category === '문학'),
  };

  const displayExams = selectedCategory === '전체' ? exams : categorizedExams[selectedCategory as keyof typeof categorizedExams] || [];

  return (
    <div className="space-y-20 pb-16 mt-8">
      {/* Page Header */}
      <div className="relative rounded-lg bg-white p-8 border-2 border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900">스스로 학습</h1>
        <p className="text-gray-600 text-lg mt-2">원하는 시험지를 선택하여 학습하세요</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-sm text-gray-600">비문학</div>
              <div className="text-2xl font-bold text-gray-900">
                {categorizedExams.비문학.length}개
              </div>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-sm text-gray-600">문학</div>
              <div className="text-2xl font-bold text-gray-900">
                {categorizedExams.문학.length}개
              </div>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-sm text-gray-600">전체 시험지</div>
              <div className="text-2xl font-bold text-gray-900">{exams.length}개</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 카테고리 필터 */}
      <Card>
        <Card.Body className="p-6">
          <div className="flex gap-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              카테고리 선택:
            </label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* 시험지 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">시험지를 불러오는 중...</p>
        </div>
      ) : displayExams.length === 0 ? (
        <Card>
          <Card.Body className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900">
              시험지가 없습니다
            </h3>
            <p className="text-gray-600 mt-2">
              다른 카테고리를 선택해보세요
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-6">
          {selectedCategory === '전체' ? (
            // 전체 보기: 카테고리별로 그룹화
            <>
              {Object.entries(categorizedExams).map(([category, categoryExams]) => {
                if (categoryExams.length === 0) return null;
                return (
                  <div key={category}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpenIcon className="w-6 h-6 text-purple-500" />
                      {category}
                      <span className="text-sm font-normal text-gray-500">
                        ({categoryExams.length}개)
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryExams.map((exam) => (
                        <Link key={exam.id} href={`/student/exams/${exam.id}`}>
                          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                            <Card.Body className="p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                {exam.title}
                              </h3>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                    {exam.category}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {exam.targetSchool} {exam.targetGrade}학년
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <ClockIcon className="w-4 h-4" />
                                  {new Date(exam.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            // 특정 카테고리 보기
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayExams.map((exam) => (
                <Link key={exam.id} href={`/student/exams/${exam.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <Card.Body className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {exam.title}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {exam.category}
                          </span>
                          <span className="text-sm text-gray-600">
                            {exam.targetSchool} {exam.targetGrade}학년
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <ClockIcon className="w-4 h-4" />
                          {new Date(exam.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

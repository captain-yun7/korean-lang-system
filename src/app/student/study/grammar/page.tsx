'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';
import { BookOpenIcon, ClockIcon } from '@heroicons/react/24/solid';

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

export default function GrammarStudyPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('examType', 'GRAMMAR');
      params.append('isPublic', 'true');

      const res = await fetch(`/api/student/exams/grammar?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch grammar exams');

      const data = await res.json();
      setExams(data.exams);
    } catch (error) {
      console.error('Error:', error);
      alert('문법 시험지 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-20 pb-16 mt-8">
      {/* Page Header */}
      <div className="relative rounded-lg bg-white p-8 border-2 border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900">문법 학습</h1>
        <p className="text-gray-600 text-lg mt-2">문법 문제를 풀어 국어 실력을 향상시키세요</p>
      </div>

      {/* 통계 */}
      <Card>
        <Card.Body className="p-6">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-10 h-10 text-orange-500" />
            <div>
              <div className="text-sm text-gray-600">문법 시험지</div>
              <div className="text-3xl font-bold text-gray-900">{exams.length}개</div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* 시험지 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">시험지를 불러오는 중...</p>
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <Card.Body className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900">
              문법 시험지가 없습니다
            </h3>
            <p className="text-gray-600 mt-2">
              선생님이 문법 시험지를 등록하면 여기에 표시됩니다
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <Link key={exam.id} href={`/student/exams/${exam.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200">
                <Card.Body className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {exam.title}
                    </h3>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium flex-shrink-0 ml-2">
                      문법
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
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
  );
}

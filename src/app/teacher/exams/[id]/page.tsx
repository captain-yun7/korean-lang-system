'use client';

import { Card, Button } from '@/components/ui';
import Link from 'next/link';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  text: string;
  type: string;
  options: string[];
  answers: string[];
  explanation: string;
}

interface ExamItem {
  passage: string;
  questions: Question[];
}

interface Exam {
  id: string;
  title: string;
  category: string;
  targetSchool: string;
  targetGrade: number;
  items: ExamItem[];
  createdAt: string;
  updatedAt: string;
  _count: {
    examResults: number;
    assignedExams: number;
  };
}

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExam();
  }, []);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/teacher/exams/${resolvedParams.id}`);
      const data = await response.json();

      if (response.ok) {
        setExam(data.examPaper);
      } else {
        alert('시험지를 불러오는데 실패했습니다.');
        router.push('/teacher/exams');
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
      alert('시험지를 불러오는데 실패했습니다.');
      router.push('/teacher/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `"${exam?.title}" 시험지를 삭제하시겠습니까?\n\n연결된 배정 및 학습 결과도 함께 삭제됩니다.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/exams/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      alert('시험지가 삭제되었습니다.');
      router.push('/teacher/exams');
    } catch (error) {
      alert('시험지 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  const totalQuestions = exam.items.reduce(
    (sum, item) => sum + item.questions.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {exam.category}
            </span>
            <span>{exam.targetSchool} {exam.targetGrade}학년</span>
            <span>•</span>
            <span>총 {totalQuestions}문항</span>
            <span>•</span>
            <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/teacher/exams/${resolvedParams.id}/assign`}>
            <Button variant="primary">학생에게 배정</Button>
          </Link>
          <Link href={`/teacher/exams/${resolvedParams.id}/edit`}>
            <Button variant="secondary">수정</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4">
        <Card padding="md">
          <div className="text-sm text-gray-600">배정 횟수</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {exam._count.assignedExams}건
          </div>
        </Card>
        <Card padding="md">
          <div className="text-sm text-gray-600">완료 횟수</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {exam._count.examResults}건
          </div>
        </Card>
        <Card padding="md">
          <div className="text-sm text-gray-600">응시 현황</div>
          <Link href={`/teacher/exams/${resolvedParams.id}/status`}>
            <Button
              variant="secondary"
              className="mt-2 w-full"
            >
              응시 현황 보기
            </Button>
          </Link>
        </Card>
      </div>

      {/* 시험지 내용 */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">시험지 내용</h2>

        {exam.items.map((item, itemIndex) => (
          <Card key={itemIndex} padding="md">
            <div className="space-y-4">
              {/* 문항 그룹 헤더 */}
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-semibold text-gray-900">
                  문항 그룹 {itemIndex + 1}
                </h3>
                <span className="text-sm text-gray-500">
                  {item.questions.length}개 문항
                </span>
              </div>

              {/* 제시문 */}
              {item.passage && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    제시문
                  </div>
                  <div className="text-gray-900 whitespace-pre-wrap">
                    {item.passage}
                  </div>
                </div>
              )}

              {/* 질문들 */}
              {item.questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="border-l-4 border-blue-500 pl-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      문항 {itemIndex + 1}-{questionIndex + 1}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {question.type}
                    </span>
                  </div>

                  {/* 질문 */}
                  <div className="text-gray-900 mb-3 whitespace-pre-wrap">
                    {question.text}
                  </div>

                  {/* 객관식 선택지 */}
                  {question.type === '객관식' && question.options.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`flex items-start gap-2 p-2 rounded ${
                            question.answers.includes(String(optionIndex + 1))
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <span className="font-medium text-gray-700 w-6">
                            {optionIndex + 1}.
                          </span>
                          <span className="text-gray-900">{option}</span>
                          {question.answers.includes(String(optionIndex + 1)) && (
                            <span className="ml-auto text-green-600 text-sm font-medium">
                              정답
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 주관식/서술형 정답 */}
                  {question.type !== '객관식' && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded mb-3">
                      <div className="text-sm font-medium text-green-700 mb-1">
                        정답
                      </div>
                      <div className="text-gray-900">
                        {question.answers.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* 해설 */}
                  {question.explanation && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <div className="text-sm font-medium text-blue-700 mb-1">
                        해설
                      </div>
                      <div className="text-gray-900 whitespace-pre-wrap">
                        {question.explanation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => router.back()}>
          목록으로
        </Button>
        <div className="flex gap-2">
          <Link href={`/teacher/exams/${resolvedParams.id}/edit`}>
            <Button variant="secondary">수정</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
}

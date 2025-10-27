'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';

interface ParagraphAnswer {
  q: string;
  answer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

interface QuestionAnswer {
  id: string;
  answer: string;
  isCorrect: boolean;
  question: {
    id: string;
    type: string;
    text: string;
    options: string[] | null;
    answers: string[];
    explanation: string | null;
  };
}

interface Result {
  id: string;
  readingTime: number;
  score: number;
  paragraphAnswers: ParagraphAnswer[];
  submittedAt: string;
  student: {
    id: string;
    studentId: string;
    name: string;
    grade: number;
    class: number;
    number: number;
  };
  passage: {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    difficulty: string;
    contentBlocks: Array<{
      para: string;
      q: string;
      a: string;
      explanation: string;
    }>;
  };
  questionAnswers: QuestionAnswer[];
}

export default function ResultDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [params.id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teacher/results/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch result');

      const data = await res.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error:', error);
      alert('성적 정보를 불러오는데 실패했습니다.');
      router.push('/teacher/results');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!result) return null;

  const paragraphCorrect =
    result.paragraphAnswers?.filter((a) => a.isCorrect).length || 0;
  const questionCorrect =
    result.questionAnswers?.filter((a) => a.isCorrect).length || 0;
  const totalCorrect = paragraphCorrect + questionCorrect;
  const totalQuestions =
    (result.paragraphAnswers?.length || 0) + result.questionAnswers.length;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">성적 상세</h1>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          목록
        </Button>
      </div>

      {/* 학생 및 지문 정보 */}
      <Card padding="md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 학생 정보 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              학생 정보
            </h3>
            <div className="space-y-1">
              <div className="flex">
                <span className="text-sm text-gray-500 w-20">이름</span>
                <span className="text-sm text-gray-900">
                  {result.student.name}
                </span>
              </div>
              <div className="flex">
                <span className="text-sm text-gray-500 w-20">학년/반</span>
                <span className="text-sm text-gray-900">
                  {result.student.grade}학년 {result.student.class}반{' '}
                  {result.student.number}번
                </span>
              </div>
              <div className="flex">
                <span className="text-sm text-gray-500 w-20">학번</span>
                <span className="text-sm text-gray-900">
                  {result.student.studentId}
                </span>
              </div>
            </div>
          </div>

          {/* 지문 정보 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              지문 정보
            </h3>
            <div className="space-y-1">
              <div className="flex">
                <span className="text-sm text-gray-500 w-20">제목</span>
                <span className="text-sm text-gray-900">
                  <Link
                    href={`/teacher/passages/${result.passage.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {result.passage.title}
                  </Link>
                </span>
              </div>
              <div className="flex">
                <span className="text-sm text-gray-500 w-20">카테고리</span>
                <span className="text-sm text-gray-900">
                  {result.passage.category} / {result.passage.subcategory}
                </span>
              </div>
              <div className="flex">
                <span className="text-sm text-gray-500 w-20">난이도</span>
                <span className="text-sm text-gray-900">
                  {result.passage.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 성적 요약 */}
      <Card padding="md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">성적 요약</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {result.score}점
            </p>
            <p className="text-sm text-gray-500 mt-1">총점</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {totalCorrect}/{totalQuestions}
            </p>
            <p className="text-sm text-gray-500 mt-1">정답 수</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {formatTime(result.readingTime)}
            </p>
            <p className="text-sm text-gray-500 mt-1">독해 시간</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {new Date(result.submittedAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">제출일</p>
          </div>
        </div>
      </Card>

      {/* 문단별 질문 답변 */}
      {result.paragraphAnswers && result.paragraphAnswers.length > 0 && (
        <Card padding="md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            문단별 질문 답변
          </h2>
          <div className="space-y-4">
            {result.paragraphAnswers.map((answer, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  answer.isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    문단 {index + 1}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      answer.isCorrect
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {answer.isCorrect ? '정답' : '오답'}
                  </span>
                </div>

                {/* 질문 */}
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">질문:</p>
                  <p className="text-sm text-gray-900">{answer.q}</p>
                </div>

                {/* 학생 답변 */}
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">학생 답변:</p>
                  <p className="text-sm text-gray-900">{answer.answer}</p>
                </div>

                {/* 정답 */}
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">정답:</p>
                  <p className="text-sm text-green-700 font-medium">
                    {answer.correctAnswer}
                  </p>
                </div>

                {/* 해설 */}
                {answer.explanation && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">해설:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {answer.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 문제별 답변 */}
      {result.questionAnswers && result.questionAnswers.length > 0 && (
        <Card padding="md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            문제별 답변
          </h2>
          <div className="space-y-4">
            {result.questionAnswers.map((answer, index) => (
              <div
                key={answer.id}
                className={`p-4 rounded-lg border-2 ${
                  answer.isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    문제 {index + 1} ({answer.question.type})
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      answer.isCorrect
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {answer.isCorrect ? '정답' : '오답'}
                  </span>
                </div>

                {/* 문제 내용 */}
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">문제:</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {answer.question.text}
                  </p>
                </div>

                {/* 객관식 선택지 */}
                {answer.question.type === '객관식' &&
                  answer.question.options && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        선택지:
                      </p>
                      <div className="space-y-1">
                        {answer.question.options.map((option, optIndex) => (
                          <div key={optIndex} className="text-sm text-gray-900">
                            {optIndex + 1}. {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 학생 답변 */}
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">학생 답변:</p>
                  <p className="text-sm text-gray-900">{answer.answer}</p>
                </div>

                {/* 정답 */}
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">정답:</p>
                  <p className="text-sm text-green-700 font-medium">
                    {answer.question.answers.join(', ')}
                  </p>
                </div>

                {/* 해설 */}
                {answer.question.explanation && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">해설:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {answer.question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';

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
    wrongAnswerExplanations: Record<string, string> | null;
  };
}

interface Result {
  id: string;
  readingTime: number;
  score: number;
  paragraphAnswers: ParagraphAnswer[];
  submittedAt: string;
  passage: {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    difficulty: string;
  };
  questionAnswers: QuestionAnswer[];
}

export default function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/results/${id}`);
      if (!res.ok) throw new Error('Failed to fetch result');

      const data = await res.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error:', error);
      alert('결과를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">결과를 불러오는 중...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">결과를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const paragraphCorrect = result.paragraphAnswers.filter((a) => a.isCorrect).length;
  const paragraphTotal = result.paragraphAnswers.length;
  const questionCorrect = result.questionAnswers.filter((a) => a.isCorrect).length;
  const questionTotal = result.questionAnswers.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 mt-8">
      {/* 헤더 */}
      <div className="relative rounded-lg bg-white p-8 border-2 border-gray-200 text-center">
        <h1 className="text-4xl font-bold text-gray-900">학습 완료!</h1>
        <p className="text-gray-600 text-lg mt-2">{result.passage.title}</p>
      </div>

      {/* 점수 카드 */}
      <Card>
        <Card.Body className="p-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">총점</p>
            <p className="text-6xl font-bold text-purple-500 mb-4">{result.score}점</p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">문단별 질문</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {paragraphCorrect} / {paragraphTotal}
                </p>
              </div>
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">문제 풀이</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {questionCorrect} / {questionTotal}
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              독해 시간: {Math.floor(result.readingTime / 60)}분 {result.readingTime % 60}초
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* 문단별 질문 결과 */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            문단별 질문 채점 결과
          </h2>
        </Card.Header>
        <Card.Body className="p-6">
          <div className="space-y-6">
            {result.paragraphAnswers.map((pa, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border-2 border-gray-200 bg-white"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      pa.isCorrect
                        ? 'bg-purple-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {pa.isCorrect ? '✓' : '✗'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">{pa.q}</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">내 답변: </span>
                        <span className="text-gray-900">{pa.answer}</span>
                      </div>
                      {!pa.isCorrect && (
                        <div>
                          <span className="font-medium text-gray-700">정답: </span>
                          <span className="text-gray-900">{pa.correctAnswer}</span>
                        </div>
                      )}
                      {pa.explanation && (
                        <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                          <span className="font-medium text-gray-700">해설: </span>
                          <span className="text-gray-600">{pa.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* 문제 풀이 결과 */}
      {result.questionAnswers.length > 0 && (
        <Card>
          <Card.Header className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              문제 풀이 채점 결과
            </h2>
          </Card.Header>
          <Card.Body className="p-6">
            <div className="space-y-6">
              {result.questionAnswers.map((qa, index) => (
                <div
                  key={qa.id}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-white"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        qa.isCorrect
                          ? 'bg-purple-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {qa.isCorrect ? '✓' : '✗'}
                    </span>
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-600">
                          {qa.question.type}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-3">
                        {index + 1}. {qa.question.text}
                      </p>

                      {/* 객관식 옵션 표시 */}
                      {qa.question.type === '객관식' && qa.question.options && (
                        <div className="mb-3 space-y-1">
                          {qa.question.options.map((option, idx) => {
                            const isStudentAnswer = qa.answer === option;
                            const isCorrectAnswer = qa.question.answers.includes(option);
                            return (
                              <div
                                key={idx}
                                className={`p-2 rounded border ${
                                  isCorrectAnswer
                                    ? 'border-purple-500 font-medium bg-white'
                                    : isStudentAnswer
                                    ? 'border-gray-400 bg-gray-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                {option}
                                {isCorrectAnswer && ' ✓'}
                                {isStudentAnswer && !isCorrectAnswer && ' (내 답)'}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">내 답변: </span>
                          <span className="text-gray-900">{qa.answer || '(미답변)'}</span>
                        </div>
                        {!qa.isCorrect && (
                          <div>
                            <span className="font-medium text-gray-700">정답: </span>
                            <span className="text-gray-900">
                              {qa.question.answers.join(', ')}
                            </span>
                          </div>
                        )}
                        {qa.question.explanation && (
                          <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                            <span className="font-medium text-gray-700">해설: </span>
                            <span className="text-gray-600">{qa.question.explanation}</span>
                          </div>
                        )}
                        {!qa.isCorrect &&
                          qa.question.wrongAnswerExplanations &&
                          qa.question.wrongAnswerExplanations[qa.answer] && (
                            <div className="mt-2 p-3 bg-yellow-50 rounded border border-yellow-200">
                              <span className="font-medium text-yellow-900">오답 해설: </span>
                              <span className="text-yellow-800">
                                {qa.question.wrongAnswerExplanations[qa.answer]}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/student/dashboard"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
        >
          대시보드로
        </Link>
        <Link
          href="/student/study/self"
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-center border-2 border-gray-900"
        >
          다른 지문 학습하기
        </Link>
        <Link
          href="/student/results"
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-center border-2 border-gray-900"
        >
          내 성적 보기
        </Link>
      </div>
    </div>
  );
}

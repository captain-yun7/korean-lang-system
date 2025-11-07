'use client';

import { Card, Button } from '@/components/ui';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

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
}

interface Answer {
  itemIndex: number;
  questionIndex: number;
  answer: string[];
}

export default function TakeExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    fetchExam();
  }, []);

  // 경과 시간 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/student/exams/${examId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '시험지를 불러올 수 없습니다.');
      }

      setExam(data.exam);

      // 답안 초기화
      const initialAnswers: Answer[] = [];
      data.exam.items.forEach((item: ExamItem, itemIndex: number) => {
        item.questions.forEach((_, questionIndex: number) => {
          initialAnswers.push({
            itemIndex,
            questionIndex,
            answer: [],
          });
        });
      });
      setAnswers(initialAnswers);
    } catch (error: any) {
      console.error('Error fetching exam:', error);
      alert(error.message || '시험지를 불러오는데 실패했습니다.');
      router.push('/student/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (
    itemIndex: number,
    questionIndex: number,
    value: string,
    isMultiple: boolean = false
  ) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const answerIndex = newAnswers.findIndex(
        (a) => a.itemIndex === itemIndex && a.questionIndex === questionIndex
      );

      if (answerIndex === -1) return prev;

      if (isMultiple) {
        // 객관식 (복수 선택 가능한 경우)
        const currentAnswers = newAnswers[answerIndex].answer;
        if (currentAnswers.includes(value)) {
          newAnswers[answerIndex].answer = currentAnswers.filter((a) => a !== value);
        } else {
          newAnswers[answerIndex].answer = [...currentAnswers, value];
        }
      } else {
        // 객관식 (단일 선택) 또는 주관식
        newAnswers[answerIndex].answer = [value];
      }

      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    // 모든 문제에 답했는지 확인
    const unansweredCount = answers.filter((a) => a.answer.length === 0).length;

    if (unansweredCount > 0) {
      if (!confirm(`${unansweredCount}개의 문제에 답하지 않았습니다.\n제출하시겠습니까?`)) {
        return;
      }
    }

    if (!confirm('시험을 제출하시겠습니까?\n제출 후에는 수정할 수 없습니다.')) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/student/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          elapsedTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '시험 제출에 실패했습니다.');
      }

      alert(`시험이 제출되었습니다!\n점수: ${data.score}점`);
      router.push(`/student/exams/${examId}/result`);
    } catch (error: any) {
      alert(error.message || '시험 제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const totalQuestions = exam.items.reduce(
    (sum, item) => sum + item.questions.length,
    0
  );
  const answeredCount = answers.filter((a) => a.answer.length > 0).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {exam.category}
              </span>
              <span>{exam.targetSchool} {exam.targetGrade}학년</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <ClockIcon className="w-5 h-5" />
              {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              답변: {answeredCount}/{totalQuestions}
            </div>
          </div>
        </div>
      </div>

      {/* 시험 문제 */}
      <div className="space-y-8">
        {exam.items.map((item, itemIndex) => (
          <Card key={itemIndex} padding="lg">
            <div className="space-y-6">
              {/* 문항 그룹 헤더 */}
              <div className="border-b pb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  문항 그룹 {itemIndex + 1}
                </h2>
              </div>

              {/* 제시문 */}
              {item.passage && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">제시문</div>
                  <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {item.passage}
                  </div>
                </div>
              )}

              {/* 질문들 */}
              {item.questions.map((question, questionIndex) => {
                const answerObj = answers.find(
                  (a) => a.itemIndex === itemIndex && a.questionIndex === questionIndex
                );
                const currentAnswer = answerObj?.answer || [];
                const globalQuestionNum = exam.items
                  .slice(0, itemIndex)
                  .reduce((sum, it) => sum + it.questions.length, 0) + questionIndex + 1;

                return (
                  <div
                    key={questionIndex}
                    className="border-l-4 border-indigo-500 pl-4 space-y-3"
                  >
                    {/* 질문 번호 및 유형 */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {globalQuestionNum}.
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {question.type}
                      </span>
                    </div>

                    {/* 질문 텍스트 */}
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {question.text}
                    </div>

                    {/* 답안 입력 */}
                    {question.type === '객관식' || question.type === 'OX' ? (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                              currentAnswer.includes(String(optionIndex + 1))
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${itemIndex}-${questionIndex}`}
                              value={optionIndex + 1}
                              checked={currentAnswer.includes(String(optionIndex + 1))}
                              onChange={(e) =>
                                handleAnswerChange(
                                  itemIndex,
                                  questionIndex,
                                  e.target.value,
                                  false
                                )
                              }
                              className="mt-1 w-4 h-4 text-indigo-600"
                            />
                            <span className="flex-1 text-gray-900">
                              <span className="font-medium mr-2">{optionIndex + 1}.</span>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <textarea
                          value={currentAnswer[0] || ''}
                          onChange={(e) =>
                            handleAnswerChange(itemIndex, questionIndex, e.target.value)
                          }
                          placeholder="답안을 입력하세요"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                          rows={question.type === '서술형' ? 5 : 2}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* 제출 버튼 */}
      <div className="bg-white rounded-lg shadow-md p-6 sticky bottom-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">
              총 {totalQuestions}문제 중 {answeredCount}문제 답변 완료
            </div>
            {answeredCount < totalQuestions && (
              <div className="text-sm text-orange-600 mt-1">
                {totalQuestions - answeredCount}개의 문제에 답하지 않았습니다
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                if (confirm('시험을 취소하고 나가시겠습니까?\n작성한 답안은 저장되지 않습니다.')) {
                  router.push('/student/exams');
                }
              }}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
              className="min-w-[120px]"
            >
              {submitting ? '제출 중...' : '시험 제출'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

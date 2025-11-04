import { Card } from '@/components/ui';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
} from '@heroicons/react/24/solid';

// 답안 체크 함수
function checkAnswer(
  correctAnswers: string[],
  studentAnswers: string[],
  questionType: string
): boolean {
  if (!studentAnswers || studentAnswers.length === 0) {
    return false;
  }

  if (questionType === '객관식') {
    if (correctAnswers.length !== studentAnswers.length) {
      return false;
    }

    const sortedCorrect = [...correctAnswers].sort();
    const sortedStudent = [...studentAnswers].sort();

    return sortedCorrect.every((ans, idx) => ans === sortedStudent[idx]);
  } else {
    const normalizedStudentAnswer = studentAnswers[0]
      ?.toLowerCase()
      .replace(/\s+/g, '') || '';

    return correctAnswers.some((correctAns) => {
      const normalizedCorrect = correctAns
        .toLowerCase()
        .replace(/\s+/g, '');
      return normalizedStudentAnswer === normalizedCorrect;
    });
  }
}

async function getExamResult(examId: string, studentId: string) {
  try {
    const student = await prisma.student.findFirst({
      where: { userId: studentId },
    });

    if (!student) return null;

    const examResult = await prisma.examResult.findFirst({
      where: {
        examId,
        studentId: student.id,
      },
      include: {
        exam: true,
      },
    });

    if (!examResult) return null;

    // 시험지 items 정보 가져오기
    const items = examResult.exam.items as any[];
    const studentAnswers = examResult.answers as any[];

    // 채점 결과 계산
    let totalQuestions = 0;
    let correctCount = 0;
    const detailedResults: any[] = [];

    items.forEach((item, itemIndex) => {
      item.questions.forEach((question: any, questionIndex: number) => {
        totalQuestions++;

        // 학생 답안 찾기
        const studentAnswer = studentAnswers.find(
          (a: any) => a.itemIndex === itemIndex && a.questionIndex === questionIndex
        );

        const isCorrect = checkAnswer(
          question.answers || [],
          studentAnswer?.answer || [],
          question.type
        );

        if (isCorrect) {
          correctCount++;
        }

        detailedResults.push({
          itemIndex,
          questionIndex,
          studentAnswer: studentAnswer?.answer || [],
          correctAnswer: question.answers || [],
          isCorrect,
        });
      });
    });

    return {
      examResult,
      items,
      student,
      detailedResults,
      totalQuestions,
      correctCount,
    };
  } catch (error) {
    console.error('Failed to fetch exam result:', error);
    return null;
  }
}

export default async function ExamResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/');
  }

  const data = await getExamResult(id, session.user.id);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">시험 결과를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const { examResult, items, detailedResults, totalQuestions, correctCount } = data;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${secs}초`;
    }
    return `${minutes}분 ${secs}초`;
  };

  const accuracy = totalQuestions > 0
    ? Math.round((correctCount / totalQuestions) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">시험 결과</h1>
        <p className="text-gray-600 mt-2">{examResult.exam.title}</p>
      </div>

      {/* 결과 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="text-sm text-gray-600">점수</div>
              <div className="text-2xl font-bold text-gray-900">{examResult.score}점</div>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-sm text-gray-600">정답률</div>
              <div className="text-2xl font-bold text-gray-900">{accuracy}%</div>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-gray-900">
              {correctCount}/{totalQuestions}
            </div>
            <div className="text-sm text-gray-600">정답 수</div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-sm text-gray-600">소요 시간</div>
              <div className="text-lg font-bold text-gray-900">
                {formatTime(examResult.totalTime)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 문제별 결과 */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">문제별 결과</h2>

        {items.map((item, itemIndex) => (
          <Card key={itemIndex} padding="lg">
            <div className="space-y-8">
              {/* 문항 그룹 헤더 */}
              <div className="border-b-2 pb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  문항 그룹 {itemIndex + 1}
                </h3>
              </div>

              {/* 제시문 */}
              {item.passage && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-3">제시문</div>
                  <div className="text-gray-900 whitespace-pre-wrap leading-relaxed text-base">
                    {item.passage}
                  </div>
                </div>
              )}

              {/* 질문들 */}
              {item.questions.map((question: any, questionIndex: number) => {
                const result = detailedResults.find(
                  (r) => r.itemIndex === itemIndex && r.questionIndex === questionIndex
                );

                const globalQuestionNum = items
                  .slice(0, itemIndex)
                  .reduce((sum, it) => sum + it.questions.length, 0) + questionIndex + 1;

                return (
                  <div
                    key={questionIndex}
                    className={`border-l-4 pl-6 py-4 space-y-4 ${
                      result?.isCorrect ? 'border-green-500' : 'border-red-500'
                    }`}
                  >
                    {/* 질문 번호 및 결과 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-gray-900">
                          {globalQuestionNum}.
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded font-medium">
                          {question.type}
                        </span>
                      </div>
                      {result?.isCorrect ? (
                        <div className="flex items-center gap-2 text-green-600 font-semibold text-base">
                          <CheckCircleIcon className="w-6 h-6" />
                          정답
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600 font-semibold text-base">
                          <XCircleIcon className="w-6 h-6" />
                          오답
                        </div>
                      )}
                    </div>

                    {/* 질문 텍스트 */}
                    <div className="text-gray-900 whitespace-pre-wrap text-base leading-7">
                      {question.text}
                    </div>

                    {/* 객관식 선택지 */}
                    {question.type === '객관식' && question.options && (
                      <div className="space-y-3 mt-4">
                        {question.options.map((option: string, optionIndex: number) => {
                          const optionNum = String(optionIndex + 1);
                          const isCorrect = result?.correctAnswer.includes(optionNum);
                          const isSelected = result?.studentAnswer.includes(optionNum);

                          return (
                            <div
                              key={optionIndex}
                              className={`p-4 rounded-lg border-2 ${
                                isCorrect
                                  ? 'border-green-500 bg-green-50'
                                  : isSelected
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 bg-white'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="font-semibold text-gray-700 text-base">
                                  {optionIndex + 1}.
                                </span>
                                <span className="flex-1 text-gray-900 text-base leading-relaxed">{option}</span>
                                {isCorrect && (
                                  <span className="text-green-600 text-sm font-semibold">
                                    정답
                                  </span>
                                )}
                                {isSelected && !isCorrect && (
                                  <span className="text-red-600 text-sm font-semibold">
                                    선택함
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 주관식/서술형 답안 */}
                    {question.type !== '객관식' && (
                      <div className="space-y-3 mt-4">
                        <div
                          className={`p-4 rounded-lg border-2 ${
                            result?.isCorrect
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                          }`}
                        >
                          <div className="text-sm font-semibold text-gray-700 mb-2">
                            내 답안
                          </div>
                          <div className="text-gray-900 text-base">
                            {result?.studentAnswer[0] || '(답안 없음)'}
                          </div>
                        </div>

                        {!result?.isCorrect && (
                          <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50">
                            <div className="text-sm font-semibold text-green-700 mb-2">
                              정답
                            </div>
                            <div className="text-gray-900 text-base">
                              {result?.correctAnswer.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 해설 */}
                    {question.explanation && (
                      <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-lg mt-4">
                        <div className="text-sm font-semibold text-blue-700 mb-3">해설</div>
                        <div className="text-gray-900 whitespace-pre-wrap text-base leading-relaxed">
                          {question.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-center gap-4 pt-6 pb-4">
        <Link
          href="/student/exams"
          className="px-8 py-3.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-base"
        >
          시험지 목록으로
        </Link>
        <Link
          href="/student/dashboard"
          className="px-8 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-base"
        >
          대시보드로
        </Link>
      </div>
    </div>
  );
}

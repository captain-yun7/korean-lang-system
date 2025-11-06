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
  UserIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/solid';
import GradingToggleButton from '@/components/teacher/GradingToggleButton';

async function getExamResult(resultId: string) {
  try {
    const examResult = await prisma.examResult.findUnique({
      where: { id: resultId },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            schoolLevel: true,
            grade: true,
            class: true,
            number: true,
          },
        },
        exam: true,
        wrongAnswers: true,
      },
    });

    if (!examResult) return null;

    // 시험지 items 정보 가져오기
    const items = examResult.exam.items as any[];
    const studentAnswers = examResult.answers as any[];

    // 총 문제 수 계산
    let totalQuestions = 0;
    items.forEach((item) => {
      totalQuestions += item.questions?.length || 0;
    });

    // 각 문제별 상세 결과 계산 (WrongAnswer 테이블 기반)
    const detailedResults: any[] = [];
    let correctCount = 0;

    items.forEach((item, itemIndex) => {
      item.questions?.forEach((question: any, questionIndex: number) => {
        // 학생 답안 찾기
        const studentAnswer = studentAnswers.find(
          (a: any) => a.itemIndex === itemIndex && a.questionIndex === questionIndex
        );

        const studentAns = studentAnswer?.answer || [];
        const correctAns = question.answers || [];

        // WrongAnswer 테이블에서 확인 (DB에 저장된 실제 채점 결과)
        const wrongAnswer = examResult.wrongAnswers.find(
          (wa) => wa.itemIndex === itemIndex && wa.questionIndex === questionIndex
        );

        // WrongAnswer에 없으면 정답, 있으면 오답
        const isCorrect = !wrongAnswer;

        if (isCorrect) {
          correctCount++;
        }

        detailedResults.push({
          itemIndex,
          questionIndex,
          studentAnswer: studentAns,
          correctAnswer: correctAns,
          isCorrect,
        });
      });
    });

    return {
      examResult,
      items,
      detailedResults,
      totalQuestions,
      correctCount,
    };
  } catch (error) {
    console.error('Failed to fetch exam result:', error);
    return null;
  }
}

export default async function TeacherResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    redirect('/');
  }

  const data = await getExamResult(id);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">성적 정보를 찾을 수 없습니다.</p>
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">성적 상세</h1>
          <p className="text-gray-600 mt-1">학생의 시험 결과를 확인하세요</p>
        </div>
        <Link
          href="/teacher/results"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          목록으로
        </Link>
      </div>

      {/* 학생 정보 */}
      <Card padding="md">
        <div className="flex items-center gap-3 mb-4">
          <UserIcon className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">학생 정보</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex">
            <span className="text-sm text-gray-500 w-24">이름</span>
            <span className="text-sm font-medium text-gray-900">
              {examResult.student.name}
            </span>
          </div>
          <div className="flex">
            <span className="text-sm text-gray-500 w-24">학번</span>
            <span className="text-sm font-medium text-gray-900">
              {examResult.student.studentId}
            </span>
          </div>
          <div className="flex">
            <span className="text-sm text-gray-500 w-24">학년/반</span>
            <span className="text-sm font-medium text-gray-900">
              {examResult.student.schoolLevel} {examResult.student.grade}학년{' '}
              {examResult.student.class}반 {examResult.student.number}번
            </span>
          </div>
          <div className="flex">
            <span className="text-sm text-gray-500 w-24">제출일</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(examResult.submittedAt).toLocaleString('ko-KR')}
            </span>
          </div>
        </div>
      </Card>

      {/* 시험지 정보 */}
      <Card padding="md">
        <div className="flex items-center gap-3 mb-4">
          <DocumentTextIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">시험지 정보</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex">
            <span className="text-sm text-gray-500 w-24">제목</span>
            <Link
              href={`/teacher/exams/${examResult.exam.id}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              {examResult.exam.title}
            </Link>
          </div>
          <div className="flex">
            <span className="text-sm text-gray-500 w-24">영역</span>
            <span className="text-sm font-medium text-gray-900">
              {examResult.exam.category}
            </span>
          </div>
          <div className="flex">
            <span className="text-sm text-gray-500 w-24">대상</span>
            <span className="text-sm font-medium text-gray-900">
              {examResult.exam.targetSchool} {examResult.exam.targetGrade}학년
            </span>
          </div>
        </div>
      </Card>

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
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">문제별 결과</h2>

        {items.map((item, itemIndex) => (
          <Card key={itemIndex} padding="lg">
            <div className="space-y-6">
              {/* 문항 그룹 헤더 */}
              <div className="border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  문항 그룹 {itemIndex + 1}
                </h3>
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
                    className={`border-l-4 pl-4 space-y-3 ${
                      result?.isCorrect ? 'border-green-500' : 'border-red-500'
                    }`}
                  >
                    {/* 질문 번호 및 결과 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {globalQuestionNum}.
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {question.type}
                        </span>
                      </div>
                      <GradingToggleButton
                        resultId={id}
                        itemIndex={itemIndex}
                        questionIndex={questionIndex}
                        isCorrect={result?.isCorrect || false}
                        questionNumber={globalQuestionNum}
                      />
                    </div>

                    {/* 질문 텍스트 */}
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {question.text}
                    </div>

                    {/* 객관식 선택지 */}
                    {question.type === '객관식' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option: string, optionIndex: number) => {
                          const optionNum = String(optionIndex + 1);
                          const isCorrect = result?.correctAnswer.includes(optionNum);
                          const isSelected = result?.studentAnswer.includes(optionNum);

                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border-2 ${
                                isCorrect
                                  ? 'border-green-500 bg-green-50'
                                  : isSelected
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-gray-700">
                                  {optionIndex + 1}.
                                </span>
                                <span className="flex-1 text-gray-900">{option}</span>
                                {isCorrect && (
                                  <span className="text-green-600 text-sm font-medium">
                                    정답
                                  </span>
                                )}
                                {isSelected && !isCorrect && (
                                  <span className="text-red-600 text-sm font-medium">
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
                      <div className="space-y-2">
                        <div
                          className={`p-3 rounded-lg border-2 ${
                            result?.isCorrect
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            학생 답안
                          </div>
                          <div className="text-gray-900">
                            {result?.studentAnswer[0] || '(답안 없음)'}
                          </div>
                        </div>

                        {!result?.isCorrect && (
                          <div className="p-3 rounded-lg border-2 border-green-500 bg-green-50">
                            <div className="text-sm font-medium text-green-700 mb-1">
                              정답
                            </div>
                            <div className="text-gray-900">
                              {result?.correctAnswer.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 해설 */}
                    {question.explanation && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                        <div className="text-sm font-medium text-blue-700 mb-1">해설</div>
                        <div className="text-gray-900 whitespace-pre-wrap">
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
      <div className="flex justify-between">
        <Link
          href="/teacher/results"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          목록으로
        </Link>
        <Link
          href={`/teacher/students/${examResult.student.id}`}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          학생 정보 보기
        </Link>
      </div>
    </div>
  );
}

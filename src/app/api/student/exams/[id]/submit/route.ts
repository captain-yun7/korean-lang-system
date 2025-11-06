import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface Answer {
  itemIndex: number;
  questionIndex: number;
  answer: string[];
}

// POST /api/student/exams/[id]/submit - 시험 제출
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 학생 정보 조회
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { error: '학생 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { answers, elapsedTime } = body as { answers: Answer[]; elapsedTime: number };

    // 유효성 검사
    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: '답안이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 시험지 조회
    const exam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      return NextResponse.json(
        { error: '시험지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 완료한 시험인지 확인
    const existingResult = await prisma.examResult.findFirst({
      where: {
        examId: id,
        studentId: student.id,
      },
    });

    if (existingResult) {
      return NextResponse.json(
        { error: '이미 완료한 시험입니다.' },
        { status: 400 }
      );
    }

    // 채점
    const items = exam.items as any[];
    let totalQuestions = 0;
    let correctCount = 0;
    const detailedResults: any[] = [];

    items.forEach((item, itemIndex) => {
      item.questions.forEach((question: any, questionIndex: number) => {
        totalQuestions++;

        // 학생 답안 찾기
        const studentAnswer = answers.find(
          (a) => a.itemIndex === itemIndex && a.questionIndex === questionIndex
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

    // 점수 계산 (100점 만점)
    const score = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

    // 결과 저장 및 오답 노트 생성 (트랜잭션)
    const examResult = await prisma.$transaction(async (tx) => {
      // 시험 결과 저장
      const result = await tx.examResult.create({
        data: {
          examId: id,
          studentId: student.id,
          score,
          answers: answers,
          totalTime: elapsedTime || 0,
        },
      });

      // 오답만 WrongAnswer 테이블에 저장
      const wrongAnswerData = detailedResults
        .filter((detail) => !detail.isCorrect)
        .map((detail) => {
          const item = items[detail.itemIndex];
          const question = item.questions[detail.questionIndex];

          return {
            studentId: student.id,
            examResultId: result.id,
            itemIndex: detail.itemIndex,
            questionIndex: detail.questionIndex,
            questionText: question.text,
            questionType: question.type,
            studentAnswer: detail.studentAnswer,
            correctAnswer: detail.correctAnswer,
            explanation: question.explanation || null,
            category: exam.category,
          };
        });

      // 오답이 있으면 저장
      if (wrongAnswerData.length > 0) {
        await tx.wrongAnswer.createMany({
          data: wrongAnswerData,
        });
      }

      return result;
    });

    return NextResponse.json({
      message: '시험이 제출되었습니다.',
      score,
      correctCount,
      totalQuestions,
      resultId: examResult.id,
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { error: '시험 제출에 실패했습니다.' },
      { status: 500 }
    );
  }
}

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
    // 객관식: 정답과 학생 답안이 정확히 일치해야 함
    if (correctAnswers.length !== studentAnswers.length) {
      return false;
    }

    const sortedCorrect = [...correctAnswers].sort();
    const sortedStudent = [...studentAnswers].sort();

    return sortedCorrect.every((ans, idx) => ans === sortedStudent[idx]);
  } else {
    // 주관식/서술형/단답형

    // 경우 1: 빈칸이 여러 개인데 학생이 콤마로 구분하여 하나의 문자열로 입력한 경우
    // 예: 정답 ["표준설", "과실"], 학생 답변 ["표준설, 과실"]
    if (correctAnswers.length > 1 && studentAnswers.length === 1) {
      const studentInput = studentAnswers[0].trim();

      // 콤마로 분리 시도
      const splitAnswers = studentInput.split(',').map(s => s.trim()).filter(s => s);

      if (splitAnswers.length === correctAnswers.length) {
        // 각 빈칸의 답을 순서대로 비교 (공백 제거, 대소문자 무시)
        return splitAnswers.every((studentAns, idx) => {
          const normalizedStudent = studentAns.toLowerCase().replace(/\s+/g, '');
          const normalizedCorrect = correctAnswers[idx].toLowerCase().replace(/\s+/g, '');
          return normalizedStudent === normalizedCorrect;
        });
      }
    }

    // 경우 2: 정답 중 하나라도 일치하면 정답 (대소문자 무시, 공백 제거)
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

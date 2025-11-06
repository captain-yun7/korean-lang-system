import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/teacher/results/[id]/update-grading - 교사가 특정 문제의 채점을 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    // 교사 권한 확인
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { itemIndex, questionIndex, isCorrect } = body as {
      itemIndex: number;
      questionIndex: number;
      isCorrect: boolean;
    };

    // 유효성 검사
    if (
      typeof itemIndex !== 'number' ||
      typeof questionIndex !== 'number' ||
      typeof isCorrect !== 'boolean'
    ) {
      return NextResponse.json(
        { error: '잘못된 요청입니다.' },
        { status: 400 }
      );
    }

    // 시험 결과 조회
    const examResult = await prisma.examResult.findUnique({
      where: { id },
      include: {
        exam: true,
        student: true,
        wrongAnswers: true,
      },
    });

    if (!examResult) {
      return NextResponse.json(
        { error: '시험 결과를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const items = examResult.exam.items as any[];
    const studentAnswers = examResult.answers as any[];

    // 해당 문제 찾기
    const item = items[itemIndex];
    const question = item?.questions?.[questionIndex];

    if (!item || !question) {
      return NextResponse.json(
        { error: '문제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const studentAnswer = studentAnswers.find(
      (a: any) => a.itemIndex === itemIndex && a.questionIndex === questionIndex
    );

    // 트랜잭션으로 처리
    await prisma.$transaction(async (tx) => {
      // 1. WrongAnswer 테이블에서 추가/제거
      const existingWrongAnswer = await tx.wrongAnswer.findFirst({
        where: {
          examResultId: id,
          itemIndex,
          questionIndex,
        },
      });

      if (isCorrect) {
        // 정답으로 변경 -> WrongAnswer 삭제
        if (existingWrongAnswer) {
          await tx.wrongAnswer.delete({
            where: { id: existingWrongAnswer.id },
          });
        }
      } else {
        // 오답으로 변경 -> WrongAnswer 추가
        if (!existingWrongAnswer) {
          await tx.wrongAnswer.create({
            data: {
              studentId: examResult.student.id,
              examResultId: id,
              itemIndex,
              questionIndex,
              questionText: question.text,
              questionType: question.type,
              studentAnswer: studentAnswer?.answer || [],
              correctAnswer: question.answers || [],
              explanation: question.explanation || null,
              category: examResult.exam.category,
            },
          });
        }
      }

      // 2. 점수 재계산 (업데이트된 WrongAnswer 테이블 기준)
      const updatedWrongAnswers = await tx.wrongAnswer.findMany({
        where: { examResultId: id },
      });

      let totalQuestions = 0;
      items.forEach((currentItem) => {
        totalQuestions += currentItem.questions?.length || 0;
      });

      const wrongCount = updatedWrongAnswers.length;
      const correctCount = totalQuestions - wrongCount;

      const newScore = totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

      await tx.examResult.update({
        where: { id },
        data: { score: newScore },
      });
    });

    return NextResponse.json({
      message: '채점이 수정되었습니다.',
      success: true,
    });
  } catch (error) {
    console.error('Error updating grading:', error);
    return NextResponse.json(
      { error: '채점 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

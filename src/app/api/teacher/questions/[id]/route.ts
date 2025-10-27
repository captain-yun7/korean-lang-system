import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/teacher/questions/[id] - 문제 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        passage: {
          select: {
            id: true,
            title: true,
            category: true,
            subcategory: true,
            difficulty: true,
          },
        },
        _count: {
          select: {
            questionAnswers: true,
            assignedQuestions: true,
            wrongAnswers: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: '존재하지 않는 문제입니다.' },
        { status: 404 }
      );
    }

    // 최근 답변 10건 조회
    const recentAnswers = await prisma.questionAnswer.findMany({
      where: { questionId: id },
      include: {
        result: {
          include: {
            student: {
              select: {
                name: true,
                grade: true,
                class: true,
                number: true,
              },
            },
          },
        },
      },
      orderBy: { result: { submittedAt: 'desc' } },
      take: 10,
    });

    // 정답률 계산
    const totalAnswers = recentAnswers.length;
    const correctAnswers = recentAnswers.filter((a) => a.isCorrect).length;
    const correctRate =
      totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

    return NextResponse.json({
      question,
      recentAnswers,
      stats: {
        totalAnswers,
        correctAnswers,
        correctRate: Math.round(correctRate * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: '문제 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/teacher/questions/[id] - 문제 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = params;

    // 문제 존재 확인
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: '존재하지 않는 문제입니다.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      passageId,
      type,
      text,
      options,
      answers,
      explanation,
      wrongAnswerExplanations,
    } = body;

    // 유효성 검사
    if (!type || !text || !answers || answers.length === 0) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 문제 유형 검증
    if (!['객관식', '단답형', '서술형'].includes(type)) {
      return NextResponse.json(
        { error: '올바른 문제 유형을 선택해주세요.' },
        { status: 400 }
      );
    }

    // 객관식인 경우 선택지 필수
    if (type === '객관식' && (!options || options.length === 0)) {
      return NextResponse.json(
        { error: '객관식 문제는 선택지를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 지문 ID가 있는 경우 존재 여부 확인
    if (passageId) {
      const passage = await prisma.passage.findUnique({
        where: { id: passageId },
      });

      if (!passage) {
        return NextResponse.json(
          { error: '존재하지 않는 지문입니다.' },
          { status: 404 }
        );
      }
    }

    // 문제 수정
    const question = await prisma.question.update({
      where: { id },
      data: {
        passageId: passageId || null,
        type,
        text,
        options: options || null,
        answers,
        explanation: explanation || null,
        wrongAnswerExplanations: wrongAnswerExplanations || null,
      },
      include: {
        passage: {
          select: {
            id: true,
            title: true,
            category: true,
            subcategory: true,
          },
        },
      },
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: '문제 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher/questions/[id] - 문제 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = params;

    // 문제 존재 확인
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: '존재하지 않는 문제입니다.' },
        { status: 404 }
      );
    }

    // 문제 삭제 (CASCADE로 연관 데이터 자동 삭제)
    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({
      message: '문제가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: '문제 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

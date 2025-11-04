import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 특정 오답 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    // 학생 ID 조회
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 오답 조회
    const wrongAnswer = await prisma.wrongAnswer.findFirst({
      where: {
        id,
        studentId: student.id,
      },
      include: {
        examResult: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!wrongAnswer) {
      return NextResponse.json({ error: 'Wrong answer not found' }, { status: 404 });
    }

    return NextResponse.json({ wrongAnswer });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 오답 복습 완료 처리
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { studentAnswer, isCorrect } = body;

    // 학생 ID 조회
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 오답 확인
    const wrongAnswer = await prisma.wrongAnswer.findFirst({
      where: {
        id,
        studentId: student.id,
      },
    });

    if (!wrongAnswer) {
      return NextResponse.json({ error: 'Wrong answer not found' }, { status: 404 });
    }

    // 복습 완료 처리 (정답을 맞혔을 경우)
    if (isCorrect) {
      await prisma.wrongAnswer.update({
        where: { id },
        data: {
          isReviewed: true,
          reviewedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: 'Review completed',
      isCorrect,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

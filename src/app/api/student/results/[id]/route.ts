import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

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

    const result = await prisma.result.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            name: true,
            studentId: true,
          },
        },
        passage: {
          select: {
            id: true,
            title: true,
            category: true,
            subcategory: true,
            difficulty: true,
            contentBlocks: true,
          },
        },
        questionAnswers: {
          include: {
            question: {
              select: {
                id: true,
                type: true,
                text: true,
                options: true,
                answers: true,
                explanation: true,
                wrongAnswerExplanations: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    // 본인의 결과인지 확인
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    });

    if (!student || result.studentId !== student.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

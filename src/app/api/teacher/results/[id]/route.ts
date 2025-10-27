import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/teacher/results/[id] - 성적 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = params;

    const result = await prisma.result.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            grade: true,
            class: true,
            number: true,
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
              },
            },
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: '존재하지 않는 성적입니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error fetching result:', error);
    return NextResponse.json(
      { error: '성적 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

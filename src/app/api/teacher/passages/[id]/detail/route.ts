import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 지문 상세 조회 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const passage = await prisma.passage.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: { createdAt: 'desc' },
        },
        results: {
          orderBy: { submittedAt: 'desc' },
          take: 10,
          include: {
            student: {
              select: {
                name: true,
                studentId: true,
              },
            },
          },
        },
        _count: {
          select: {
            questions: true,
            results: true,
          },
        },
      },
    });

    if (!passage) {
      return NextResponse.json(
        { error: '지문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ passage });
  } catch (error) {
    console.error('Failed to fetch passage detail:', error);
    return NextResponse.json(
      { error: '지문 상세 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

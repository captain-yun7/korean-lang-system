import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/student/exams/self-study - 자습용 시험지 목록 조회
export const GET = auth(async function GET(request) {
  try {
    const session = request.auth;

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';

    // 필터 조건 구성
    const where: any = {
      examType: 'SELF_STUDY',
      isPublic: true,
    };

    if (category) {
      where.category = category;
    }

    // 시험지 목록 조회
    const exams = await prisma.exam.findMany({
      where,
      include: {
        _count: {
          select: {
            examResults: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Error fetching self-study exams:', error);
    return NextResponse.json(
      { error: '자습용 시험지 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}) as any;

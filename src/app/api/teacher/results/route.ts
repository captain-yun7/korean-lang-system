import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/teacher/results - 성적 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터
    const studentId = searchParams.get('studentId') || '';
    const passageId = searchParams.get('passageId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const sortBy = searchParams.get('sortBy') || 'submittedAt'; // submittedAt or score
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // asc or desc
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (passageId) {
      where.passageId = passageId;
    }

    // 기간별 필터링
    if (startDate || endDate) {
      where.submittedAt = {};
      if (startDate) {
        where.submittedAt.gte = new Date(startDate);
      }
      if (endDate) {
        // endDate는 해당 날짜의 23:59:59까지 포함
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.submittedAt.lte = end;
      }
    }

    // 정렬 조건
    const orderBy: any = {};
    if (sortBy === 'score') {
      orderBy.score = sortOrder;
    } else {
      orderBy.submittedAt = sortOrder;
    }

    // 성적 목록 조회
    const [results, total] = await Promise.all([
      prisma.result.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
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
            },
          },
          _count: {
            select: {
              questionAnswers: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.result.count({ where }),
    ]);

    return NextResponse.json({
      results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: '성적 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

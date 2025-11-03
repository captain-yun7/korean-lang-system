import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/teacher/results - 시험 성적 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const studentId = searchParams.get('studentId');
    const examId = searchParams.get('examId');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'submittedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 필터 조건 생성
    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (examId) {
      where.examId = examId;
    }

    if (category) {
      where.exam = {
        category,
      };
    }

    if (startDate || endDate) {
      where.submittedAt = {};
      if (startDate) {
        where.submittedAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.submittedAt.lte = end;
      }
    }

    // 정렬 조건
    const orderBy: any = {};
    if (sortBy === 'submittedAt') {
      orderBy.submittedAt = sortOrder;
    } else if (sortBy === 'score') {
      orderBy.score = sortOrder;
    }

    // 페이지네이션
    const skip = (page - 1) * limit;

    // 성적 조회
    const [results, total] = await Promise.all([
      prisma.examResult.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              schoolLevel: true,
              grade: true,
              class: true,
              number: true,
            },
          },
          exam: {
            select: {
              id: true,
              title: true,
              category: true,
              targetSchool: true,
              targetGrade: true,
            },
          },
        },
      }),
      prisma.examResult.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: '성적 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 학생 자신의 성적 목록 조회 (Exam 기반)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 학생 ID 조회
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // 필터 조건
    const where: any = { studentId: student.id };

    if (category) {
      where.exam = { category };
    }

    if (startDate && endDate) {
      where.submittedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // 시험 결과 목록 조회
    const results = await prisma.examResult.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: {
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
    });

    // 통계 계산
    const stats = {
      totalResults: results.length,
      averageScore: results.length > 0
        ? Math.round((results.reduce((sum, r) => sum + r.score, 0) / results.length) * 10) / 10
        : 0,
      totalReadingTime: results.reduce((sum, r) => sum + r.totalTime, 0),
      highestScore: results.length > 0 ? Math.max(...results.map(r => r.score)) : 0,
      lowestScore: results.length > 0 ? Math.min(...results.map(r => r.score)) : 0,
    };

    return NextResponse.json({ results, stats });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


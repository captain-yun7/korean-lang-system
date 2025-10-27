import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 학생 오답 목록 조회
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
    const isReviewed = searchParams.get('isReviewed');

    // 필터 조건
    const where: any = { studentId: student.id };

    if (isReviewed !== null && isReviewed !== '') {
      where.isReviewed = isReviewed === 'true';
    }

    // 오답 목록 조회
    const wrongAnswers = await prisma.wrongAnswer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        question: {
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
          },
        },
      },
    });

    // 카테고리 필터링 (클라이언트 측에서도 가능하지만 서버에서 처리)
    let filteredAnswers = wrongAnswers;
    if (category) {
      filteredAnswers = wrongAnswers.filter(
        (wa) => wa.question.passage?.category === category
      );
    }

    // 통계 계산
    const totalWrong = filteredAnswers.length;
    const reviewedCount = filteredAnswers.filter((wa) => wa.isReviewed).length;
    const unreviewedCount = totalWrong - reviewedCount;

    // 카테고리별 통계
    const categoryStats: { [key: string]: number } = {};
    filteredAnswers.forEach((wa) => {
      const cat = wa.question.passage?.category || '기타';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    // 자주 틀리는 카테고리 (상위 3개)
    const frequentCategories = Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    return NextResponse.json({
      wrongAnswers: filteredAnswers,
      stats: {
        totalWrong,
        reviewedCount,
        unreviewedCount,
        frequentCategories,
        categoryStats,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

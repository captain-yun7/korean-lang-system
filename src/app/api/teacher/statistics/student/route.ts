import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/teacher/statistics/student?studentId=xxx - 개인별 성적 추이
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: '학생 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        studentId: true,
        name: true,
        grade: true,
        class: true,
        number: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: '학생을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 학생의 모든 시험 결과 (시간순)
    const results = await prisma.examResult.findMany({
      where: { studentId },
      include: {
        exam: {
          select: {
            title: true,
            category: true,
            subcategory: true,
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    // 꺾은선 그래프용 데이터
    const trendData = results.map((r) => ({
      date: r.submittedAt.toISOString().split('T')[0],
      examTitle: r.exam.title,
      category: r.exam.category,
      subcategory: r.exam.subcategory,
      score: r.score,
      attemptNumber: r.attemptNumber,
    }));

    // 카테고리별 평균
    const categoryMap = new Map<string, { total: number; count: number }>();
    for (const r of results) {
      const cat = r.exam.category;
      const current = categoryMap.get(cat) || { total: 0, count: 0 };
      current.total += r.score;
      current.count += 1;
      categoryMap.set(cat, current);
    }

    const categoryAvg = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      avgScore: Math.round((data.total / data.count) * 10) / 10,
      count: data.count,
    }));

    // 세부 카테고리별 평균 (category + subcategory 조합)
    const subcategoryMap = new Map<string, { total: number; count: number }>();
    for (const r of results) {
      const sub = r.exam.subcategory;
      if (!sub) continue;
      const key = `${r.exam.category} ${sub}`;
      const current = subcategoryMap.get(key) || { total: 0, count: 0 };
      current.total += r.score;
      current.count += 1;
      subcategoryMap.set(key, current);
    }

    const subcategoryAvg = Array.from(subcategoryMap.entries()).map(([label, data]) => ({
      label,
      avgScore: Math.round((data.total / data.count) * 10) / 10,
      count: data.count,
    }));

    // 전체 평균
    const avgScore =
      results.length > 0
        ? Math.round(
            (results.reduce((sum, r) => sum + r.score, 0) / results.length) * 10
          ) / 10
        : 0;

    return NextResponse.json({
      student,
      summary: {
        totalExams: results.length,
        avgScore,
        highestScore: results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0,
        lowestScore: results.length > 0 ? Math.min(...results.map((r) => r.score)) : 0,
      },
      trendData,
      categoryAvg,
      subcategoryAvg,
    });
  } catch (error) {
    console.error('Error fetching student statistics:', error);
    return NextResponse.json(
      { error: '학생 통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

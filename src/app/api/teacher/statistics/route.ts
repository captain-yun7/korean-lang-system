import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/teacher/statistics - 전체 통계 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 전체 통계
    const totalStudents = await prisma.student.count();
    const totalPassages = await prisma.passage.count();
    const totalQuestions = await prisma.question.count();
    const totalResults = await prisma.result.count();

    // 전체 평균 점수
    const avgScoreResult = await prisma.result.aggregate({
      _avg: {
        score: true,
      },
    });

    // 학년별 평균 점수
    const gradeStats = await prisma.$queryRaw<
      Array<{ grade: number; avgScore: number; count: number }>
    >`
      SELECT
        s.grade,
        ROUND(AVG(r.score)::numeric, 1) as "avgScore",
        COUNT(r.id)::int as count
      FROM results r
      JOIN students s ON r."studentId" = s.id
      GROUP BY s.grade
      ORDER BY s.grade
    `;

    // 반별 평균 점수 (학년+반 조합)
    const classStats = await prisma.$queryRaw<
      Array<{ grade: number; class: number; avgScore: number; count: number }>
    >`
      SELECT
        s.grade,
        s.class,
        ROUND(AVG(r.score)::numeric, 1) as "avgScore",
        COUNT(r.id)::int as count
      FROM results r
      JOIN students s ON r."studentId" = s.id
      GROUP BY s.grade, s.class
      ORDER BY s.grade, s.class
    `;

    // 카테고리별 평균 점수
    const categoryStats = await prisma.$queryRaw<
      Array<{ category: string; avgScore: number; count: number }>
    >`
      SELECT
        p.category,
        ROUND(AVG(r.score)::numeric, 1) as "avgScore",
        COUNT(r.id)::int as count
      FROM results r
      JOIN passages p ON r."passageId" = p.id
      GROUP BY p.category
      ORDER BY p.category
    `;

    // 세부 카테고리별 평균 점수
    const subcategoryStats = await prisma.$queryRaw<
      Array<{
        category: string;
        subcategory: string;
        avgScore: number;
        count: number;
      }>
    >`
      SELECT
        p.category,
        p.subcategory,
        ROUND(AVG(r.score)::numeric, 1) as "avgScore",
        COUNT(r.id)::int as count
      FROM results r
      JOIN passages p ON r."passageId" = p.id
      GROUP BY p.category, p.subcategory
      ORDER BY p.category, p.subcategory
    `;

    // 난이도별 평균 점수
    const difficultyStats = await prisma.$queryRaw<
      Array<{ difficulty: string; avgScore: number; count: number }>
    >`
      SELECT
        p.difficulty,
        ROUND(AVG(r.score)::numeric, 1) as "avgScore",
        COUNT(r.id)::int as count
      FROM results r
      JOIN passages p ON r."passageId" = p.id
      GROUP BY p.difficulty
      ORDER BY
        CASE p.difficulty
          WHEN '중학교' THEN 1
          WHEN '고1-2' THEN 2
          WHEN '고3' THEN 3
          ELSE 4
        END
    `;

    // 최근 30일 성적 추이 (일별)
    const recentTrend = await prisma.$queryRaw<
      Array<{ date: string; avgScore: number; count: number }>
    >`
      SELECT
        TO_CHAR(r."submittedAt", 'YYYY-MM-DD') as date,
        ROUND(AVG(r.score)::numeric, 1) as "avgScore",
        COUNT(r.id)::int as count
      FROM results r
      WHERE r."submittedAt" >= NOW() - INTERVAL '30 days'
      GROUP BY TO_CHAR(r."submittedAt", 'YYYY-MM-DD')
      ORDER BY date
    `;

    return NextResponse.json({
      overview: {
        totalStudents,
        totalPassages,
        totalQuestions,
        totalResults,
        avgScore: avgScoreResult._avg.score
          ? Math.round(avgScoreResult._avg.score * 10) / 10
          : 0,
      },
      gradeStats,
      classStats,
      categoryStats,
      subcategoryStats,
      difficultyStats,
      recentTrend,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: '통계 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

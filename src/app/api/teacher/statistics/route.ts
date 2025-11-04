import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/teacher/statistics - 전체 통계 조회
export const GET = auth(async function GET(request) {
  try {
    const session = request.auth;

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 전체 통계
    const totalStudents = await prisma.student.count();
    const totalPassages = await prisma.passage.count();
    const totalQuestions = await prisma.question.count();
    const totalExams = await prisma.exam.count();
    const totalResults = await prisma.examResult.count();

    // 전체 평균 점수
    const avgScoreResult = await prisma.examResult.aggregate({
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
      FROM exam_results r
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
      FROM exam_results r
      JOIN students s ON r."studentId" = s.id
      GROUP BY s.grade, s.class
      ORDER BY s.grade, s.class
    `;

    // 카테고리별 평균 점수
    const categoryStats = await prisma.$queryRaw<
      Array<{ category: string; avgScore: number; count: number }>
    >`
      SELECT
        e.category,
        ROUND(AVG(r.score)::numeric, 1) as "avgScore",
        COUNT(r.id)::int as count
      FROM exam_results r
      JOIN exams e ON r."examId" = e.id
      GROUP BY e.category
      ORDER BY e.category
    `;

    // 대상 학년별 평균 점수
    const targetGradeStats = await prisma.$queryRaw<
      Array<{
        targetSchool: string;
        targetGrade: number;
        avgScore: number;
        count: number;
      }>
    >`
      SELECT
        e."targetSchool",
        e."targetGrade",
        ROUND(AVG(r.score)::numeric, 1) as "avgScore",
        COUNT(r.id)::int as count
      FROM exam_results r
      JOIN exams e ON r."examId" = e.id
      GROUP BY e."targetSchool", e."targetGrade"
      ORDER BY e."targetSchool", e."targetGrade"
    `;

    // 최근 30일 성적 추이 (일별)
    const recentTrend = await prisma.$queryRaw<
      Array<{ date: string; avgScore: number; count: number }>
    >`
      SELECT
        TO_CHAR(r."submittedAt", 'YYYY-MM-DD') as date,
        ROUND(AVG(r.score)::numeric, 1) as "avgScore",
        COUNT(r.id)::int as count
      FROM exam_results r
      WHERE r."submittedAt" >= NOW() - INTERVAL '30 days'
      GROUP BY TO_CHAR(r."submittedAt", 'YYYY-MM-DD')
      ORDER BY date
    `;

    return NextResponse.json({
      overview: {
        totalStudents,
        totalPassages,
        totalQuestions,
        totalExams,
        totalResults,
        avgScore: avgScoreResult._avg.score
          ? Math.round(avgScoreResult._avg.score * 10) / 10
          : 0,
      },
      gradeStats,
      classStats,
      categoryStats,
      targetGradeStats,
      recentTrend,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: '통계 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}) as any;

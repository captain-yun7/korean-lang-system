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
    const totalExams = await prisma.exam.count();
    const totalResults = await prisma.examResult.count();
    const totalWrongAnswers = await prisma.wrongAnswer.count();

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

    // 개인별 성적 추이 (학생 목록 + 각 학생의 시험 결과)
    const studentList = await prisma.student.findMany({
      select: {
        id: true,
        studentId: true,
        name: true,
        grade: true,
        class: true,
        number: true,
      },
      orderBy: [{ grade: 'asc' }, { class: 'asc' }, { number: 'asc' }],
    });

    // 시험지별 통계 (최고점, 평균, 최저점)
    const examStats = await prisma.$queryRaw<
      Array<{
        examId: string;
        title: string;
        category: string;
        maxScore: number;
        avgScore: number;
        minScore: number;
        count: number;
      }>
    >`
      SELECT
        e.id as "examId",
        e.title,
        e.category,
        MAX(r.score)::int as "maxScore",
        ROUND(AVG(r.score)::numeric, 1) as "avgScore",
        MIN(r.score)::int as "minScore",
        COUNT(r.id)::int as count
      FROM exam_results r
      JOIN exams e ON r."examId" = e.id
      GROUP BY e.id, e.title, e.category
      ORDER BY e.title
    `;

    // 비문학 파트별 세분화 통계 (subcategory 기반)
    const subcategoryStats = await prisma.$queryRaw<
      Array<{ category: string; subcategory: string; avgScore: number; count: number }>
    >`
      SELECT
        e.category,
        p.subcategory,
        ROUND(AVG(r.score)::numeric, 1) as "avgScore",
        COUNT(r.id)::int as count
      FROM exam_results r
      JOIN exams e ON r."examId" = e.id
      JOIN passages p ON p.id = ANY(
        SELECT jsonb_array_elements_text(
          jsonb_path_query_array(e.items::jsonb, '$[*].passageId')
        )
      )
      WHERE p.subcategory IS NOT NULL
      GROUP BY e.category, p.subcategory
      ORDER BY e.category, p.subcategory
    `;

    return NextResponse.json({
      overview: {
        totalStudents,
        totalPassages,
        totalExams,
        totalResults,
        totalWrongAnswers,
        avgScore: avgScoreResult._avg.score
          ? Math.round(avgScoreResult._avg.score * 10) / 10
          : 0,
      },
      gradeStats,
      classStats,
      categoryStats,
      targetGradeStats,
      recentTrend,
      studentList,
      examStats,
      subcategoryStats,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: '통계 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}) as any;

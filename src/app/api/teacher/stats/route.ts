import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. 인증 확인
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. 통계 데이터 조회 (병렬 처리로 성능 최적화)
    const [
      totalStudents,
      activeStudents,
      totalPassages,
      totalQuestions,
      averageScoreData,
    ] = await Promise.all([
      // 전체 학생 수
      prisma.student.count(),

      // 활성화된 학생 수
      prisma.student.count({
        where: { isActive: true },
      }),

      // 전체 지문 수
      prisma.passage.count(),

      // 전체 문제 수
      prisma.question.count(),

      // 평균 성적 계산
      prisma.result.aggregate({
        _avg: {
          totalScore: true,
        },
      }),
    ]);

    // 3. 응답 데이터 구성
    const stats = {
      totalStudents,
      activeStudents,
      totalPassages,
      totalQuestions,
      averageScore: averageScoreData._avg.totalScore
        ? Math.round(averageScoreData._avg.totalScore * 10) / 10
        : 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

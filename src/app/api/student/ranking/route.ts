import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 순위 조회 API
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 학생 정보 조회
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'class'; // class, grade, all

    // 모든 학생의 평균 점수 계산
    let students = await prisma.student.findMany({
      where: {
        isActive: true,
        ...(type === 'class' && {
          grade: student.grade,
          class: student.class,
        }),
        ...(type === 'grade' && {
          grade: student.grade,
        }),
      },
      include: {
        results: {
          select: {
            score: true,
          },
        },
      },
    });

    // 평균 점수 계산 및 순위 매기기
    const studentsWithAverage = students
      .map((s) => {
        const totalScore = s.results.reduce((sum, r) => sum + r.score, 0);
        const count = s.results.length;
        const averageScore = count > 0 ? Math.round((totalScore / count) * 10) / 10 : 0;

        return {
          id: s.id,
          studentId: s.studentId,
          name: s.name,
          grade: s.grade,
          class: s.class,
          number: s.number,
          averageScore,
          totalResults: count,
        };
      })
      .filter((s) => s.totalResults > 0) // 학습 기록이 있는 학생만
      .sort((a, b) => {
        if (b.averageScore !== a.averageScore) {
          return b.averageScore - a.averageScore; // 점수 높은 순
        }
        // 점수가 같으면 학습 횟수가 많은 순
        return b.totalResults - a.totalResults;
      });

    // 순위 매기기
    let currentRank = 1;
    const rankedStudents = studentsWithAverage.map((s, index) => {
      if (index > 0 && s.averageScore < studentsWithAverage[index - 1].averageScore) {
        currentRank = index + 1;
      }
      return {
        ...s,
        rank: currentRank,
      };
    });

    // 본인 순위 찾기
    const myRank = rankedStudents.find((s) => s.id === student.id);

    // 상위 5명 (이름 비공개)
    const top5 = rankedStudents.slice(0, 5).map((s) => ({
      rank: s.rank,
      grade: s.grade,
      class: s.class,
      number: s.number,
      averageScore: s.averageScore,
      totalResults: s.totalResults,
      isMe: s.id === student.id, // 본인인지 표시
    }));

    // 본인 순위 정보 (이름 포함)
    const myRankInfo = myRank
      ? {
          rank: myRank.rank,
          name: myRank.name,
          grade: myRank.grade,
          class: myRank.class,
          number: myRank.number,
          averageScore: myRank.averageScore,
          totalResults: myRank.totalResults,
        }
      : null;

    return NextResponse.json({
      type,
      totalStudents: rankedStudents.length,
      top5,
      myRank: myRankInfo,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

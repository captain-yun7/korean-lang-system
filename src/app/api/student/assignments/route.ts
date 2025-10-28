import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 학생에게 배정된 과제 목록 조회
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

    // 배정된 지문 조회 (개인 배정 + 학년/반 배정)
    const assignedPassages = await prisma.assignedPassage.findMany({
      where: {
        OR: [
          { assignedTo: student.id }, // 개인 배정
          {
            // 학년/반 배정
            targetGrade: student.grade,
            targetClass: student.class,
            assignedTo: null,
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        passage: {
          include: {
            _count: {
              select: { questions: true },
            },
          },
        },
      },
    });

    // 각 지문의 완료 여부 확인
    const passagesWithCompletion = await Promise.all(
      assignedPassages.map(async (ap) => {
        const result = await prisma.result.findFirst({
          where: {
            studentId: student.id,
            passageId: ap.passageId,
            submittedAt: {
              gte: ap.createdAt, // 배정 이후에 제출한 결과만
            },
          },
          orderBy: { submittedAt: 'desc' },
        });

        return {
          id: ap.id,
          passageId: ap.passageId,
          passage: ap.passage,
          dueDate: ap.dueDate,
          createdAt: ap.createdAt,
          isCompleted: !!result,
          completedAt: result?.submittedAt || null,
          score: result?.score || null,
        };
      })
    );

    // 통계 계산
    const totalAssignments = passagesWithCompletion.length;
    const completedCount = passagesWithCompletion.filter((p) => p.isCompleted).length;
    const pendingCount = totalAssignments - completedCount;
    const overdueCount = passagesWithCompletion.filter(
      (p) => !p.isCompleted && p.dueDate && new Date(p.dueDate) < new Date()
    ).length;

    return NextResponse.json({
      assignments: passagesWithCompletion,
      stats: {
        total: totalAssignments,
        completed: completedCount,
        pending: pendingCount,
        overdue: overdueCount,
        completionRate:
          totalAssignments > 0
            ? Math.round((completedCount / totalAssignments) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

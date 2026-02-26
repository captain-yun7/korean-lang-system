import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 시험지 응시 현황 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const examId = params.id;

    // 시험지 정보 조회
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        title: true,
        category: true,
        targetSchool: true,
        targetGrade: true,
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: '시험지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 배정된 학생 목록과 응시 결과 조회
    const assignments = await prisma.assignedExam.findMany({
      where: { examId },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            schoolLevel: true,
            grade: true,
            class: true,
            number: true,
          },
        },
      },
      orderBy: [
        { student: { grade: 'asc' } },
        { student: { class: 'asc' } },
        { student: { number: 'asc' } },
      ],
    });

    // 각 학생의 응시 결과 조회 (모든 회차)
    const studentIds = assignments
      .map((a) => a.assignedTo)
      .filter((id): id is string => id !== null);

    const results = await prisma.examResult.findMany({
      where: {
        examId,
        studentId: { in: studentIds },
      },
      select: {
        id: true,
        studentId: true,
        score: true,
        attemptNumber: true,
        submittedAt: true,
      },
      orderBy: { attemptNumber: 'desc' },
    });

    // 결과를 학생별로 매핑 (최신 결과)
    const latestResultByStudent = new Map<string, typeof results[0]>();
    const attemptCountByStudent = new Map<string, number>();

    for (const r of results) {
      if (!latestResultByStudent.has(r.studentId)) {
        latestResultByStudent.set(r.studentId, r);
      }
      attemptCountByStudent.set(
        r.studentId,
        (attemptCountByStudent.get(r.studentId) || 0) + 1
      );
    }

    // 응시 현황 데이터 생성
    const statusData = assignments.map((assignment) => {
      const studentId = assignment.assignedTo;
      const result = studentId ? latestResultByStudent.get(studentId) : null;
      const attemptCount = studentId
        ? attemptCountByStudent.get(studentId) || 0
        : 0;

      return {
        assignmentId: assignment.id,
        dueDate: assignment.dueDate,
        allowRetake: assignment.allowRetake,
        maxAttempts: assignment.maxAttempts,
        student: assignment.student,
        isCompleted: !!result,
        attemptCount,
        result: result
          ? {
              id: result.id,
              score: result.score,
              attemptNumber: result.attemptNumber,
              submittedAt: result.submittedAt,
            }
          : null,
      };
    });

    // 통계 계산
    const totalAssigned = statusData.length;
    const completedCount = statusData.filter((s) => s.isCompleted).length;
    const incompletedCount = totalAssigned - completedCount;
    const completionRate =
      totalAssigned > 0
        ? Math.round((completedCount / totalAssigned) * 100)
        : 0;

    return NextResponse.json({
      exam,
      statistics: {
        totalAssigned,
        completedCount,
        incompletedCount,
        completionRate,
      },
      students: statusData,
    });
  } catch (error) {
    console.error('Failed to fetch exam status:', error);
    return NextResponse.json(
      { error: '응시 현황 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

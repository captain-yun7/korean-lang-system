import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// POST /api/teacher/exams/[id]/assign - 시험지 배정
export const POST = auth(async function POST(
  request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request.auth;

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { studentIds, dueDate } = body;

    // 유효성 검사
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: '배정할 학생을 선택해주세요.' },
        { status: 400 }
      );
    }

    if (!dueDate) {
      return NextResponse.json(
        { error: '마감일을 선택해주세요.' },
        { status: 400 }
      );
    }

    const { id } = await params;

    // 시험지 존재 확인
    const exam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      return NextResponse.json(
        { error: '시험지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 학생들 존재 확인
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: '일부 학생을 찾을 수 없습니다.' },
        { status: 400 }
      );
    }

    // 배정 생성 (기존 배정이 있으면 업데이트)
    const assignments = await Promise.all(
      studentIds.map(async (studentId) => {
        // 기존 배정 확인
        const existing = await prisma.assignedExam.findFirst({
          where: {
            examId: id,
            assignedTo: studentId,
          },
        });

        if (existing) {
          // 기존 배정 업데이트
          return await prisma.assignedExam.update({
            where: { id: existing.id },
            data: {
              dueDate: new Date(dueDate),
            },
          });
        } else {
          // 새 배정 생성
          return await prisma.assignedExam.create({
            data: {
              examId: id,
              assignedBy: session.user.id, // 교사 ID
              assignedTo: studentId,
              dueDate: new Date(dueDate),
            },
          });
        }
      })
    );

    return NextResponse.json({
      message: `${assignments.length}명의 학생에게 시험지가 배정되었습니다.`,
      count: assignments.length,
    });
  } catch (error) {
    console.error('Error assigning exam:', error);
    return NextResponse.json(
      { error: '시험지 배정에 실패했습니다.' },
      { status: 500 }
    );
  }
}) as any;

// GET /api/teacher/exams/[id]/assign - 배정된 학생 목록 조회
export const GET = auth(async function GET(
  request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request.auth;

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = await params;

    const assignments = await prisma.assignedExam.findMany({
      where: { examId: id },
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
        { student: { schoolLevel: 'asc' } },
        { student: { grade: 'asc' } },
        { student: { class: 'asc' } },
        { student: { number: 'asc' } },
      ],
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: '배정 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}) as any;

// DELETE /api/teacher/exams/[id]/assign - 시험지 배정 취소
export const DELETE = auth(async function DELETE(
  request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request.auth;

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json(
        { error: '배정 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 배정 존재 확인
    const assignment = await prisma.assignedExam.findFirst({
      where: {
        id: assignmentId,
        examId: id,
      },
      include: {
        student: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: '배정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 시험을 완료한 경우 취소 불가
    const existingResult = await prisma.examResult.findFirst({
      where: {
        examId: id,
        studentId: assignment.assignedTo,
      },
    });

    if (existingResult) {
      return NextResponse.json(
        { error: '이미 시험을 완료한 학생의 배정은 취소할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 배정 삭제
    await prisma.assignedExam.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({
      message: `${assignment.student.name} 학생의 배정이 취소되었습니다.`,
    });
  } catch (error) {
    console.error('Error canceling assignment:', error);
    return NextResponse.json(
      { error: '배정 취소에 실패했습니다.' },
      { status: 500 }
    );
  }
}) as any;

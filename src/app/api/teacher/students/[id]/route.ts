import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 학생 상세 조회 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        examResults: {
          orderBy: { submittedAt: 'desc' },
          take: 10,
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: '학생을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Failed to fetch student:', error);
    return NextResponse.json(
      { error: '학생 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 학생 정보 수정 (PUT)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      schoolLevel,
      password,
      isActive,
      activationStartDate,
      activationEndDate,
    } = body;

    // 필수 필드 확인
    if (!name || !schoolLevel) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 학교급 검증
    if (!['중등', '고등'].includes(schoolLevel)) {
      return NextResponse.json(
        { error: '올바른 학교급을 선택해주세요.' },
        { status: 400 }
      );
    }

    // 기존 학생 정보 조회
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: '학생을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 해싱 (비밀번호가 제공된 경우만)
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Student 및 User 업데이트 (트랜잭션)
    const updatedStudent = await prisma.$transaction(async (tx) => {
      // User 업데이트 (이름과 비밀번호만)
      await tx.user.update({
        where: { id: existingStudent.userId },
        data: {
          name,
          ...(hashedPassword && { password: hashedPassword }),
        },
      });

      // Student 업데이트 (학번, 학년/반/번호는 변경 불가)
      const student = await tx.student.update({
        where: { id },
        data: {
          name,
          schoolLevel,
          isActive,
          activationStartDate: activationStartDate
            ? new Date(activationStartDate)
            : null,
          activationEndDate: activationEndDate ? new Date(activationEndDate) : null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      return student;
    });

    return NextResponse.json({
      message: '학생 정보가 성공적으로 수정되었습니다.',
      student: {
        id: updatedStudent.id,
        studentId: updatedStudent.studentId,
        name: updatedStudent.name,
        grade: updatedStudent.grade,
        class: updatedStudent.class,
        number: updatedStudent.number,
        isActive: updatedStudent.isActive,
      },
    });
  } catch (error) {
    console.error('Failed to update student:', error);
    return NextResponse.json(
      { error: '학생 정보 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 학생 삭제 (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 학생 정보 조회
    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: '학생을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // User 삭제 (Student는 CASCADE로 자동 삭제됨)
    await prisma.user.delete({
      where: { id: student.userId },
    });

    return NextResponse.json({
      message: '학생이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Failed to delete student:', error);
    return NextResponse.json(
      { error: '학생 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 학생 상세 조회 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      userId, // 로그인 아이디
      schoolLevel,
      grade: gradeStr,
      class: classStr,
      number: numberStr,
      password,
      isActive,
      activationStartDate,
      activationEndDate,
    } = body;

    // 숫자 변환
    const grade = parseInt(gradeStr);
    const classNum = parseInt(classStr);
    const number = parseInt(numberStr);

    // 필수 필드 확인
    if (!name || !userId || !schoolLevel || isNaN(grade) || isNaN(classNum) || isNaN(number)) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었거나 올바르지 않습니다.' },
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
      where: { id: params.id },
      include: { user: true },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: '학생을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // userId가 변경되었는지 확인하고 중복 체크
    if (userId !== existingStudent.user.email) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          email: userId,
          id: { not: existingStudent.userId },
        },
      });

      if (duplicateUser) {
        return NextResponse.json(
          { error: `이미 사용 중인 아이디입니다: ${userId}` },
          { status: 400 }
        );
      }
    }

    // 학년/반/번호가 변경되었는지 확인
    const isClassInfoChanged =
      existingStudent.grade !== grade ||
      existingStudent.class !== classNum ||
      existingStudent.number !== number;

    let newStudentId = existingStudent.studentId;

    if (isClassInfoChanged) {
      // 새로운 학번 생성
      newStudentId = `${String(grade).padStart(2, '0')}${String(classNum).padStart(
        2,
        '0'
      )}${String(number).padStart(2, '0')}`;

      // 새로운 학번이 이미 존재하는지 확인 (자기 자신 제외)
      const duplicateStudent = await prisma.student.findFirst({
        where: {
          studentId: newStudentId,
          id: { not: params.id },
        },
      });

      if (duplicateStudent) {
        return NextResponse.json(
          { error: `이미 등록된 학번입니다: ${grade}학년 ${classNum}반 ${number}번` },
          { status: 400 }
        );
      }
    }

    // 비밀번호 해싱 (비밀번호가 제공된 경우만)
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Student 및 User 업데이트 (트랜잭션)
    const updatedStudent = await prisma.$transaction(async (tx) => {
      // User 업데이트
      await tx.user.update({
        where: { id: existingStudent.userId },
        data: {
          name,
          email: userId, // userId를 email 필드에 저장
          ...(hashedPassword && { password: hashedPassword }),
        },
      });

      // Student 업데이트
      const student = await tx.student.update({
        where: { id: params.id },
        data: {
          studentId: newStudentId,
          name,
          schoolLevel,
          grade,
          class: classNum,
          number,
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
        studentIdChanged: isClassInfoChanged,
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
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 학생 정보 조회
    const student = await prisma.student.findUnique({
      where: { id: params.id },
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

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 학생 등록 (POST)
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      userId, // 학생 로그인 아이디
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
    if (!name || !userId || !schoolLevel || isNaN(grade) || isNaN(classNum) || isNaN(number) || !password) {
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

    // 학번 생성 (예: 030201 - 3학년 2반 1번)
    const studentId = `${String(grade).padStart(2, '0')}${String(classNum).padStart(
      2,
      '0'
    )}${String(number).padStart(2, '0')}`;

    // 중복 학번 확인
    const existingStudent = await prisma.student.findUnique({
      where: { studentId },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: `이미 등록된 학번입니다: ${grade}학년 ${classNum}반 ${number}번` },
        { status: 400 }
      );
    }

    // 중복 userId 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: `이미 사용 중인 아이디입니다: ${userId}` },
        { status: 400 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // User 및 Student 레코드 생성 (트랜잭션)
    const student = await prisma.$transaction(async (tx) => {
      // User 생성
      const user = await tx.user.create({
        data: {
          name,
          email: userId, // userId를 email 필드에 저장 (로그인용)
          password: hashedPassword,
          role: 'STUDENT',
        },
      });

      // Student 생성
      const newStudent = await tx.student.create({
        data: {
          userId: user.id,
          studentId,
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

      return newStudent;
    });

    return NextResponse.json(
      {
        message: '학생이 성공적으로 등록되었습니다.',
        student: {
          id: student.id,
          studentId: student.studentId,
          name: student.name,
          grade: student.grade,
          class: student.class,
          number: student.number,
          isActive: student.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create student:', error);
    return NextResponse.json(
      { error: '학생 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 학생 목록 조회 (GET) - 추후 필요시 구현
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const students = await prisma.student.findMany({
      orderBy: [{ grade: 'asc' }, { class: 'asc' }, { number: 'asc' }],
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

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return NextResponse.json(
      { error: '학생 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

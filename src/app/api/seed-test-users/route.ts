import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    console.log('🌱 테스트 계정 생성 시작...\n');

    // 교사 계정 생성
    const teacherPassword = await bcrypt.hash('teacher123', 10);

    // 기존 교사 확인
    const existingTeacher = await prisma.user.findUnique({
      where: { email: 'teacher@test.com' },
    });

    let teacher;
    if (!existingTeacher) {
      teacher = await prisma.user.create({
        data: {
          email: 'teacher@test.com',
          password: teacherPassword,
          name: '김선생',
          role: 'TEACHER',
          teacher: {
            create: {
              teacherId: 'teacher001',
              name: '김선생',
            },
          },
        },
      });
      console.log('✅ 교사 계정 생성 완료');
    } else {
      console.log('ℹ️ 교사 계정이 이미 존재합니다');
    }

    // 학생 계정 생성
    const studentPassword = await bcrypt.hash('student123', 10);

    // 기존 학생 확인
    const existingStudent = await prisma.user.findUnique({
      where: { email: 'student001' },
    });

    let student;
    if (!existingStudent) {
      student = await prisma.user.create({
        data: {
          email: 'student001',
          password: studentPassword,
          name: '김철수',
          role: 'STUDENT',
          student: {
            create: {
              studentId: '030201',
              name: '김철수',
              grade: 3,
              class: 2,
              number: 1,
              isActive: true,
              activationStartDate: new Date(),
              activationEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년 후
            },
          },
        },
      });
      console.log('✅ 학생 계정 생성 완료');
    } else {
      console.log('ℹ️ 학생 계정이 이미 존재합니다');
    }

    return NextResponse.json({
      success: true,
      message: '테스트 계정 생성 완료',
      accounts: {
        teacher: {
          id: 'teacher001',
          password: 'teacher123',
          description: '교사 로그인',
        },
        student: {
          studentId: '030201',
          userId: 'student001',
          password: 'student123',
          description: '학생 로그인 (3학년 2반 1번 김철수)',
        },
      },
    });
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

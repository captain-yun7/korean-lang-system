import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// POST /api/teacher/students/promote - 학년 일괄 진급
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 3학년 학생 비활성화 (졸업)
    const graduated = await prisma.student.updateMany({
      where: {
        grade: 3,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // 2학년 → 3학년
    const promoted2to3 = await prisma.student.updateMany({
      where: {
        grade: 2,
        isActive: true,
      },
      data: {
        grade: 3,
      },
    });

    // 1학년 → 2학년
    const promoted1to2 = await prisma.student.updateMany({
      where: {
        grade: 1,
        isActive: true,
      },
      data: {
        grade: 2,
      },
    });

    return NextResponse.json({
      message: '학년 진급이 완료되었습니다.',
      graduated: graduated.count,
      promoted: promoted2to3.count + promoted1to2.count,
      details: {
        '3학년 졸업(비활성화)': graduated.count,
        '2학년 → 3학년': promoted2to3.count,
        '1학년 → 2학년': promoted1to2.count,
      },
    });
  } catch (error) {
    console.error('Error promoting students:', error);
    return NextResponse.json(
      { error: '학년 진급에 실패했습니다.' },
      { status: 500 }
    );
  }
}

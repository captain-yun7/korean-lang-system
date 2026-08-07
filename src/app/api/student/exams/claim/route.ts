import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isValidShareCode } from '@/lib/share-code';

// POST /api/student/exams/claim - 공유 코드로 응시 자격(배정) 획득
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const code = body?.code;

    if (typeof code !== 'string' || !isValidShareCode(code)) {
      return NextResponse.json(
        { error: '유효하지 않은 공유 코드입니다.' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { error: '학생 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const exam = await prisma.exam.findUnique({
      where: { shareCode: code },
      select: { id: true, maxAttempts: true },
    });

    if (!exam) {
      return NextResponse.json(
        { error: '공유가 해제되었거나 존재하지 않는 시험지입니다.' },
        { status: 404 }
      );
    }

    // 이미 배정돼 있으면 그대로 재사용 (교사가 배정한 조건을 덮어쓰지 않는다)
    const existing = await prisma.assignedExam.findFirst({
      where: { examId: exam.id, assignedTo: student.id },
    });

    if (!existing) {
      await prisma.assignedExam.create({
        data: {
          examId: exam.id,
          assignedBy: 'SHARE_LINK',
          assignedTo: student.id,
          allowRetake: exam.maxAttempts > 1,
          maxAttempts: exam.maxAttempts,
        },
      });
    }

    return NextResponse.json({ examId: exam.id });
  } catch (error) {
    console.error('Error claiming shared exam:', error);
    return NextResponse.json(
      { error: '응시 준비에 실패했습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 문법/개념 문제 목록 조회 (passageId가 null인 문제들)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // passageId가 null인 문법 문제들만 조회
    const questions = await prisma.question.findMany({
      where: {
        passageId: null, // 문법/개념 문제
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        text: true,
        type: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

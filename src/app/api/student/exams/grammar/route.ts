import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/student/exams/grammar - 8ï ‹ÿ¿ ©] på
export const GET = auth(async function GET(request) {
  try {
    const session = request.auth;

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'å\t ∆µ»‰.' }, { status: 403 });
    }

    // 8ï ‹ÿ¿ på
    const exams = await prisma.exam.findMany({
      where: {
        examType: 'GRAMMAR',
        isPublic: true,
      },
      include: {
        _count: {
          select: {
            examResults: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Error fetching grammar exams:', error);
    return NextResponse.json(
      { error: '8ï ‹ÿ¿ ©]D àÏ$îp ‰(àµ»‰.' },
      { status: 500 }
    );
  }
}) as any;

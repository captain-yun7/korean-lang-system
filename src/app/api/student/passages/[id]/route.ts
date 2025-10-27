import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    const passage = await prisma.passage.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            type: true,
            text: true,
            options: true,
            answers: true,
            explanation: true,
            wrongAnswerExplanations: true,
          },
        },
      },
    });

    if (!passage) {
      return NextResponse.json({ error: 'Passage not found' }, { status: 404 });
    }

    return NextResponse.json({ passage });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

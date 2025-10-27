import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (difficulty) where.difficulty = difficulty;
    if (search) where.title = { contains: search };

    const passages = await prisma.passage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    return NextResponse.json({ passages });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

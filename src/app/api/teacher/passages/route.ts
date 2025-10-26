import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 지문 등록 (POST)
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, category, subcategory, difficulty, contentBlocks } = body;

    // 필수 필드 확인
    if (!title || !category || !subcategory || !difficulty || !contentBlocks) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // contentBlocks 유효성 검사
    if (!Array.isArray(contentBlocks) || contentBlocks.length === 0) {
      return NextResponse.json(
        { error: '최소 1개의 문단이 필요합니다.' },
        { status: 400 }
      );
    }

    for (const block of contentBlocks) {
      if (!block.para || !block.q || !block.a) {
        return NextResponse.json(
          { error: '모든 문단의 필수 필드(para, q, a)를 입력해주세요.' },
          { status: 400 }
        );
      }
    }

    // Passage 생성
    const passage = await prisma.passage.create({
      data: {
        title,
        category,
        subcategory,
        difficulty,
        contentBlocks,
      },
    });

    return NextResponse.json(
      {
        message: '지문이 성공적으로 등록되었습니다.',
        passage: {
          id: passage.id,
          title: passage.title,
          category: passage.category,
          subcategory: passage.subcategory,
          difficulty: passage.difficulty,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create passage:', error);
    return NextResponse.json(
      { error: '지문 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 지문 목록 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const passages = await prisma.passage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            questions: true,
            results: true,
          },
        },
      },
    });

    return NextResponse.json({ passages });
  } catch (error) {
    console.error('Failed to fetch passages:', error);
    return NextResponse.json(
      { error: '지문 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

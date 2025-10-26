import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 지문 상세 조회 (GET)
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

    const passage = await prisma.passage.findUnique({
      where: { id: params.id },
      include: {
        questions: true,
        _count: {
          select: {
            questions: true,
            results: true,
          },
        },
      },
    });

    if (!passage) {
      return NextResponse.json(
        { error: '지문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ passage });
  } catch (error) {
    console.error('Failed to fetch passage:', error);
    return NextResponse.json(
      { error: '지문 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 지문 정보 수정 (PUT)
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

    // 지문 존재 확인
    const existingPassage = await prisma.passage.findUnique({
      where: { id: params.id },
    });

    if (!existingPassage) {
      return NextResponse.json(
        { error: '지문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Passage 업데이트
    const updatedPassage = await prisma.passage.update({
      where: { id: params.id },
      data: {
        title,
        category,
        subcategory,
        difficulty,
        contentBlocks,
      },
    });

    return NextResponse.json({
      message: '지문이 성공적으로 수정되었습니다.',
      passage: {
        id: updatedPassage.id,
        title: updatedPassage.title,
        category: updatedPassage.category,
        subcategory: updatedPassage.subcategory,
        difficulty: updatedPassage.difficulty,
      },
    });
  } catch (error) {
    console.error('Failed to update passage:', error);
    return NextResponse.json(
      { error: '지문 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 지문 삭제 (DELETE)
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

    // 지문 존재 확인
    const passage = await prisma.passage.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            questions: true,
            results: true,
          },
        },
      },
    });

    if (!passage) {
      return NextResponse.json(
        { error: '지문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 연관된 데이터 확인 (optional - 경고 목적)
    if (passage._count.questions > 0 || passage._count.results > 0) {
      // CASCADE 설정되어 있으므로 자동으로 삭제되지만, 경고 메시지는 표시
      console.log(
        `Warning: Deleting passage ${params.id} with ${passage._count.questions} questions and ${passage._count.results} results`
      );
    }

    // Passage 삭제 (연결된 Questions, Results 등은 CASCADE로 자동 삭제)
    await prisma.passage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: '지문이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Failed to delete passage:', error);
    return NextResponse.json(
      { error: '지문 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

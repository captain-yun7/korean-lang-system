import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/teacher/exam-papers/[id] - 시험지 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const examPaper = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            examResults: true,
            assignedExams: true,
          },
        },
      },
    });

    if (!examPaper) {
      return NextResponse.json(
        { error: '시험지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ examPaper });
  } catch (error) {
    console.error('Error fetching exam paper:', error);
    return NextResponse.json(
      { error: '시험지를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher/exam-papers/[id] - 시험지 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 시험지 존재 여부 확인
    const examPaper = await prisma.exam.findUnique({
      where: { id: params.id },
    });

    if (!examPaper) {
      return NextResponse.json(
        { error: '시험지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 시험지 삭제 (cascading으로 관련 데이터도 삭제됨)
    await prisma.exam.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: '시험지가 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting exam paper:', error);
    return NextResponse.json(
      { error: '시험지 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/teacher/exam-papers/[id] - 시험지 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, category, targetGrade, targetClass, items } = body;

    // 유효성 검사
    if (!title || !category || !targetGrade || !items || items.length === 0) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 시험지 존재 여부 확인
    const existingExamPaper = await prisma.exam.findUnique({
      where: { id: params.id },
    });

    if (!existingExamPaper) {
      return NextResponse.json(
        { error: '시험지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 시험지 수정
    const examPaper = await prisma.exam.update({
      where: { id: params.id },
      data: {
        title,
        category,
        targetGrade,
        targetClass: targetClass || null,
        items,
      },
    });

    return NextResponse.json({ examPaper });
  } catch (error) {
    console.error('Error updating exam paper:', error);
    return NextResponse.json(
      { error: '시험지 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

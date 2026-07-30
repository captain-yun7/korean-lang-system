import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateShareCode } from '@/lib/share-code';

// POST /api/teacher/exams/[id]/share - 공유 링크 발급 (이미 있으면 기존 코드 반환)
export const POST = auth(async function POST(
  request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request.auth;

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = await params;
    const exam = await prisma.exam.findUnique({
      where: { id },
      select: { id: true, shareCode: true },
    });

    if (!exam) {
      return NextResponse.json(
        { error: '시험지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (exam.shareCode) {
      return NextResponse.json({ shareCode: exam.shareCode });
    }

    // unique 충돌 시 재시도
    for (let attempt = 0; attempt < 5; attempt++) {
      const shareCode = generateShareCode();
      try {
        const updated = await prisma.exam.update({
          where: { id },
          data: { shareCode },
          select: { shareCode: true },
        });
        return NextResponse.json({ shareCode: updated.shareCode });
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code !== 'P2002') throw error;
      }
    }

    return NextResponse.json(
      { error: '공유 코드 생성에 실패했습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: '공유 링크 발급에 실패했습니다.' },
      { status: 500 }
    );
  }
}) as any;

// DELETE /api/teacher/exams/[id]/share - 공유 링크 해제
export const DELETE = auth(async function DELETE(
  request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request.auth;

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.exam.update({
      where: { id },
      data: { shareCode: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking share link:', error);
    return NextResponse.json(
      { error: '공유 링크 해제에 실패했습니다.' },
      { status: 500 }
    );
  }
}) as any;

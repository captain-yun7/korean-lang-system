import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/teacher/questions - 문제 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터
    const search = searchParams.get('search') || '';
    const passageId = searchParams.get('passageId') || '';
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {};

    if (search) {
      where.text = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (passageId) {
      if (passageId === 'null') {
        // 독립 문제 (지문 없음)
        where.passageId = null;
      } else {
        where.passageId = passageId;
      }
    }

    if (type) {
      where.type = type;
    }

    // 문제 목록 조회
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          passage: {
            select: {
              id: true,
              title: true,
              category: true,
              subcategory: true,
            },
          },
          _count: {
            select: {
              questionAnswers: true, // 답변 수
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({
      questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: '문제 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/teacher/questions - 문제 등록
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      passageId,
      type,
      text,
      options,
      answers,
      explanation,
      wrongAnswerExplanations,
    } = body;

    // 유효성 검사
    if (!type || !text || !answers || answers.length === 0) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 문제 유형 검증
    if (!['객관식', '단답형', '서술형'].includes(type)) {
      return NextResponse.json(
        { error: '올바른 문제 유형을 선택해주세요.' },
        { status: 400 }
      );
    }

    // 객관식인 경우 선택지 필수
    if (type === '객관식' && (!options || options.length === 0)) {
      return NextResponse.json(
        { error: '객관식 문제는 선택지를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 지문 ID가 있는 경우 존재 여부 확인
    if (passageId) {
      const passage = await prisma.passage.findUnique({
        where: { id: passageId },
      });

      if (!passage) {
        return NextResponse.json(
          { error: '존재하지 않는 지문입니다.' },
          { status: 404 }
        );
      }
    }

    // 문제 생성
    const question = await prisma.question.create({
      data: {
        passageId: passageId || null,
        type,
        text,
        options: options || null,
        answers,
        explanation: explanation || null,
        wrongAnswerExplanations: wrongAnswerExplanations || null,
      },
      include: {
        passage: {
          select: {
            id: true,
            title: true,
            category: true,
            subcategory: true,
          },
        },
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: '문제 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}

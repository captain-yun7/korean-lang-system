import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/teacher/exam-papers - 시험지 목록 조회
export const GET = auth(async function GET(request) {
  try {
    const session = request.auth;

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const targetGrade = searchParams.get('targetGrade') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {};

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (category) {
      where.category = category;
    }

    if (targetGrade) {
      where.targetGrade = parseInt(targetGrade);
    }

    // 시험지 목록 조회
    const [examPapers, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        include: {
          _count: {
            select: {
              examResults: true,
              assignedExams: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.exam.count({ where }),
    ]);

    return NextResponse.json({
      examPapers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching exam papers:', error);
    return NextResponse.json(
      { error: '시험지 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}) as any;

// POST /api/teacher/exam-papers - 시험지 등록
export const POST = auth(async function POST(request) {
  try {
    const session = request.auth;
    console.log('[API] POST /api/teacher/exams - Session:', session);

    if (!session || session.user.role !== 'TEACHER') {
      console.log('[API] Access denied - session:', session, 'role:', session?.user?.role);
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, category, examType, isPublic, targetSchool, targetGrade, items } = body;

    // 유효성 검사
    if (!title || !category || !examType || !targetSchool || !targetGrade || !items || items.length === 0) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 카테고리 검증
    if (!['비문학', '문학', '문법', '어휘', '기타'].includes(category)) {
      return NextResponse.json(
        { error: '올바른 영역을 선택해주세요.' },
        { status: 400 }
      );
    }

    // 학교급 검증
    if (!['중등', '고등'].includes(targetSchool)) {
      return NextResponse.json(
        { error: '올바른 대상을 선택해주세요.' },
        { status: 400 }
      );
    }

    // 각 문항 검사
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.questions || item.questions.length === 0) {
        return NextResponse.json(
          { error: `${i + 1}번 문항 그룹에 질문이 없습니다.` },
          { status: 400 }
        );
      }

      for (let j = 0; j < item.questions.length; j++) {
        const question = item.questions[j];
        if (!question.text || !question.answers || question.answers.length === 0) {
          return NextResponse.json(
            { error: `${i + 1}번 문항 그룹의 ${j + 1}번 질문이 유효하지 않습니다.` },
            { status: 400 }
          );
        }
      }
    }

    // examType 검증
    if (!['SELF_STUDY', 'ASSIGNED', 'GRAMMAR'].includes(examType)) {
      return NextResponse.json(
        { error: '올바른 시험지 타입을 선택해주세요.' },
        { status: 400 }
      );
    }

    // 시험지 생성
    const examPaper = await prisma.exam.create({
      data: {
        title,
        category,
        examType,
        isPublic: isPublic ?? false,
        targetSchool,
        targetGrade,
        items,
      },
    });

    return NextResponse.json({ examPaper }, { status: 201 });
  } catch (error) {
    console.error('Error creating exam paper:', error);
    return NextResponse.json(
      { error: '시험지 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}) as any;

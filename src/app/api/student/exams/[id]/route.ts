import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/student/exams/[id] - 시험지 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 학생 정보 조회
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { error: '학생 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 시험지 조회
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
    });

    if (!exam) {
      return NextResponse.json(
        { error: '시험지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 완료한 시험인지 확인
    const existingResult = await prisma.examResult.findFirst({
      where: {
        examId: params.id,
        studentId: student.id,
      },
    });

    if (existingResult) {
      return NextResponse.json(
        { error: '이미 완료한 시험입니다.' },
        { status: 400 }
      );
    }

    // 정답은 제거하고 반환 (보안)
    const examData = {
      id: exam.id,
      title: exam.title,
      category: exam.category,
      targetSchool: exam.targetSchool,
      targetGrade: exam.targetGrade,
      items: (exam.items as any[]).map((item) => ({
        passage: item.passage,
        questions: item.questions.map((q: any) => ({
          text: q.text,
          type: q.type,
          options: q.options || [],
          // answers와 explanation은 제거
        })),
      })),
    };

    return NextResponse.json({ exam: examData });
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json(
      { error: '시험지를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

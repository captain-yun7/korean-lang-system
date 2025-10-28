import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 특정 문법 문제 조회
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

    const question = await prisma.question.findFirst({
      where: {
        id,
        passageId: null, // 문법 문제만
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 문법 문제 채점
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { answer } = body;

    // 학생 정보 조회
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 문제 조회
    const question = await prisma.question.findFirst({
      where: {
        id,
        passageId: null,
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // 채점 (유사도 기반)
    const calculateSimilarity = (answer: string, correctAnswer: string): number => {
      const a = answer.toLowerCase().trim();
      const c = correctAnswer.toLowerCase().trim();

      if (a === c) return 1.0;
      if (a.includes(c) || c.includes(a)) return 0.7;

      const aWords = a.split(/\s+/);
      const cWords = c.split(/\s+/);
      const matchCount = aWords.filter((word) => cWords.includes(word)).length;

      if (matchCount > 0) {
        return matchCount / Math.max(aWords.length, cWords.length);
      }

      return 0;
    };

    let isCorrect = false;

    if (question.type === '객관식') {
      isCorrect = answer === question.answers[0];
    } else if (question.type === '단답형') {
      isCorrect = question.answers.some(
        (ans) => calculateSimilarity(answer, ans) >= 0.9
      );
    } else if (question.type === '서술형') {
      const similarity = Math.max(
        ...question.answers.map((ans) => calculateSimilarity(answer, ans))
      );
      isCorrect = similarity >= 0.7;
    }

    // 오답인 경우 저장
    if (!isCorrect) {
      await prisma.wrongAnswer.create({
        data: {
          studentId: student.id,
          questionId: question.id,
          wrongAnswer: answer,
          correctAnswer: question.answers.join(' / '),
          explanation: question.explanation,
          isReviewed: false,
        },
      });
    }

    return NextResponse.json({
      isCorrect,
      correctAnswer: question.answers,
      explanation: question.explanation,
      wrongAnswerExplanations: question.wrongAnswerExplanations,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 학생 자신의 성적 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 학생 ID 조회
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // 필터 조건
    const where: any = { studentId: student.id };

    if (category) {
      where.passage = { category };
    }

    if (startDate && endDate) {
      where.submittedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // 성적 목록 조회
    const results = await prisma.result.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: {
        passage: {
          select: {
            id: true,
            title: true,
            category: true,
            subcategory: true,
            difficulty: true,
          },
        },
      },
    });

    // 통계 계산
    const stats = {
      totalResults: results.length,
      averageScore: results.length > 0
        ? Math.round((results.reduce((sum, r) => sum + r.score, 0) / results.length) * 10) / 10
        : 0,
      totalReadingTime: results.reduce((sum, r) => sum + r.readingTime, 0),
      highestScore: results.length > 0 ? Math.max(...results.map(r => r.score)) : 0,
      lowestScore: results.length > 0 ? Math.min(...results.map(r => r.score)) : 0,
    };

    return NextResponse.json({ results, stats });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST는 이미 result 제출용으로 있음
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 학생 ID 조회
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const body = await request.json();
    const { passageId, readingTime, paragraphAnswers, questionAnswers } = body;

    // 지문 정보 조회
    const passage = await prisma.passage.findUnique({
      where: { id: passageId },
      include: {
        questions: true,
      },
    });

    if (!passage) {
      return NextResponse.json({ error: 'Passage not found' }, { status: 404 });
    }

    const contentBlocks = passage.contentBlocks as Array<{
      para: string;
      q: string;
      a: string;
      explanation: string;
    }>;

    // 유사도 계산 함수
    function calculateSimilarity(answer: string, correctAnswer: string): number {
      const a = answer.toLowerCase().trim();
      const c = correctAnswer.toLowerCase().trim();

      if (a === c) return 1.0;
      if (a.includes(c) || c.includes(a)) return 0.7;

      const aWords = a.split(/\s+/);
      const cWords = c.split(/\s+/);
      const matchCount = aWords.filter(word => cWords.includes(word)).length;

      if (matchCount > 0) {
        return matchCount / Math.max(aWords.length, cWords.length);
      }

      return 0;
    }

    // 문단별 답변 채점
    const paragraphResults = paragraphAnswers.map((answer: string, index: number) => {
      const block = contentBlocks[index];
      const similarity = calculateSimilarity(answer, block.a);
      const isCorrect = similarity >= 0.7;

      return {
        q: block.q,
        answer,
        correctAnswer: block.a,
        isCorrect,
        explanation: block.explanation,
      };
    });

    const paragraphScore = paragraphResults.filter((r) => r.isCorrect).length;
    const paragraphTotal = paragraphResults.length;

    // 문제별 답변 채점
    const questionResults = [];
    let questionScore = 0;
    const questionTotal = passage.questions.length;

    for (const question of passage.questions) {
      const studentAnswer = questionAnswers[question.id];
      let isCorrect = false;

      if (question.type === '객관식') {
        isCorrect = studentAnswer === question.answers[0];
      } else if (question.type === '단답형') {
        isCorrect = question.answers.some((ans) =>
          calculateSimilarity(studentAnswer, ans) >= 0.9
        );
      } else if (question.type === '서술형') {
        const similarity = Math.max(
          ...question.answers.map((ans) => calculateSimilarity(studentAnswer, ans))
        );
        isCorrect = similarity >= 0.7;
      }

      if (isCorrect) questionScore++;

      questionResults.push({
        questionId: question.id,
        question: question,
        answer: studentAnswer,
        isCorrect,
      });
    }

    // 총점 계산
    const totalScore = Math.round(
      ((paragraphScore / paragraphTotal) * 50 + (questionScore / questionTotal) * 50) * 10
    ) / 10;

    // 결과 저장
    const result = await prisma.result.create({
      data: {
        studentId: student.id,
        passageId,
        readingTime,
        score: totalScore,
        paragraphAnswers: paragraphResults,
        submittedAt: new Date(),
        questionAnswers: {
          create: questionResults.map((qr) => ({
            questionId: qr.questionId,
            answer: qr.answer,
            isCorrect: qr.isCorrect,
          })),
        },
      },
    });

    // 오답 저장
    const wrongAnswers = questionResults.filter((qr) => !qr.isCorrect);
    if (wrongAnswers.length > 0) {
      await prisma.wrongAnswer.createMany({
        data: wrongAnswers.map((wa) => ({
          studentId: student.id,
          questionId: wa.questionId,
          wrongAnswer: wa.answer,
          correctAnswer: wa.question.answers.join(' / '),
          explanation: wa.question.explanation || null,
        })),
      });
    }

    return NextResponse.json({
      resultId: result.id,
      score: totalScore,
      paragraphScore,
      questionScore,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

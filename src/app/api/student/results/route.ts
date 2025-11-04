import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const GET = auth(async function GET(request) {
  try {
    const session = request.auth;

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const studentId = session.user.studentId;
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID not found' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { studentId },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = {
      studentId: student.id,
    };

    if (category) {
      where.exam = {
        category,
      };
    }

    const examResults = await prisma.examResult.findMany({
      where,
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            category: true,
            targetSchool: true,
            targetGrade: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const stats = {
      totalResults: examResults.length,
      averageScore: examResults.length > 0
        ? Math.round(examResults.reduce((sum, r) => sum + r.score, 0) / examResults.length)
        : 0,
      totalReadingTime: examResults.reduce((sum, r) => sum + r.totalTime, 0),
      highestScore: examResults.length > 0
        ? Math.max(...examResults.map(r => r.score))
        : 0,
      lowestScore: examResults.length > 0
        ? Math.min(...examResults.map(r => r.score))
        : 0,
    };

    return NextResponse.json({
      results: examResults,
      stats,
    });
  } catch (error) {
    console.error('Error fetching student results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}) as any;

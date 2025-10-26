import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. 인증 확인
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. URL 파라미터에서 limit 가져오기 (기본값: 10)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // 3. 최근 학습 결과 조회
    const recentResults = await prisma.result.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        passage: {
          select: {
            title: true,
          },
        },
      },
    });

    // 4. 응답 데이터 가공
    const activities = recentResults.map((result) => {
      // 시간 계산 (예: "10분 전", "1시간 전", "2일 전")
      const timeAgo = getTimeAgo(result.createdAt);

      return {
        id: result.id,
        studentName: result.student.user.name,
        action: '지문 학습 완료',
        passageTitle: result.passage.title,
        score: result.totalScore,
        time: timeAgo,
        createdAt: result.createdAt,
      };
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Recent Activities API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// 시간 차이를 "~분 전", "~시간 전" 형태로 변환
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  // 7일 이상이면 날짜 표시
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  });
}

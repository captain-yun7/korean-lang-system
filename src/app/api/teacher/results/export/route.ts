import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

// GET /api/teacher/results/export - 성적 Excel 다운로드
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 (필터링)
    const studentId = searchParams.get('studentId') || '';
    const passageId = searchParams.get('passageId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const sortBy = searchParams.get('sortBy') || 'submittedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 필터 조건 구성
    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (passageId) {
      where.passageId = passageId;
    }

    // 기간별 필터링
    if (startDate || endDate) {
      where.submittedAt = {};
      if (startDate) {
        where.submittedAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.submittedAt.lte = end;
      }
    }

    // 정렬 조건
    const orderBy: any = {};
    if (sortBy === 'score') {
      orderBy.score = sortOrder;
    } else {
      orderBy.submittedAt = sortOrder;
    }

    // 성적 목록 조회 (전체, 제한 없음)
    const results = await prisma.result.findMany({
      where,
      include: {
        student: {
          select: {
            studentId: true,
            name: true,
            grade: true,
            class: true,
            number: true,
          },
        },
        passage: {
          select: {
            title: true,
            category: true,
            subcategory: true,
            difficulty: true,
          },
        },
        _count: {
          select: {
            questionAnswers: true,
          },
        },
      },
      orderBy,
    });

    // Excel 데이터 생성
    const data = results.map((result) => ({
      학번: result.student.studentId,
      이름: result.student.name,
      학년: result.student.grade,
      반: result.student.class,
      번호: result.student.number,
      지문제목: result.passage.title,
      카테고리: result.passage.category,
      세부카테고리: result.passage.subcategory,
      난이도: result.passage.difficulty,
      점수: result.score,
      독해시간_초: result.readingTime,
      문제수: result._count.questionAnswers,
      제출일시: new Date(result.submittedAt).toLocaleString('ko-KR', { hour12: false }),
    }));

    // 워크북 생성
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '성적');

    // 컬럼 너비 설정
    worksheet['!cols'] = [
      { wch: 10 }, // 학번
      { wch: 10 }, // 이름
      { wch: 5 }, // 학년
      { wch: 5 }, // 반
      { wch: 5 }, // 번호
      { wch: 30 }, // 지문제목
      { wch: 10 }, // 카테고리
      { wch: 15 }, // 세부카테고리
      { wch: 10 }, // 난이도
      { wch: 8 }, // 점수
      { wch: 12 }, // 독해시간
      { wch: 8 }, // 문제수
      { wch: 20 }, // 제출일시
    ];

    // Buffer로 변환
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 파일명 생성
    const today = new Date().toISOString().split('T')[0];
    const filename = `성적_${today}.xlsx`;

    // 응답 반환
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(
          filename
        )}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting results:', error);
    return NextResponse.json(
      { error: '성적 다운로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}

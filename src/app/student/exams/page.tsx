import { Card } from '@/components/ui';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  ClockIcon,
  CheckCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/solid';

interface ExamWithStatus {
  id: string;
  title: string;
  category: string;
  targetSchool: string;
  targetGrade: number;
  createdAt: Date;
  isAssigned: boolean;
  dueDate: Date | null;
  isCompleted: boolean;
  completedAt: Date | null;
  score: number | null;
}

// 학생이 볼 수 있는 시험지 목록 가져오기
async function getStudentExams(studentId: string): Promise<ExamWithStatus[]> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { schoolLevel: true, grade: true },
    });

    if (!student) return [];

    // 모든 시험지 가져오기
    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignedExams: {
          where: { assignedTo: studentId },
        },
        examResults: {
          where: { studentId },
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
      },
    });

    // 시험지 상태 정보 추가
    const examsWithStatus: ExamWithStatus[] = exams.map((exam) => {
      const assignment = exam.assignedExams[0];
      const result = exam.examResults[0];

      return {
        id: exam.id,
        title: exam.title,
        category: exam.category,
        targetSchool: exam.targetSchool,
        targetGrade: exam.targetGrade,
        createdAt: exam.createdAt,
        isAssigned: !!assignment,
        dueDate: assignment?.dueDate || null,
        isCompleted: !!result,
        completedAt: result?.submittedAt || null,
        score: result?.score || null,
      };
    });

    return examsWithStatus;
  } catch (error) {
    console.error('Failed to fetch exams:', error);
    return [];
  }
}

export default async function StudentExamsPage() {
  // 인증 확인
  const session = await auth();
  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/');
  }

  const studentId = session.user.id;

  // 학생 ID로 student 레코드 찾기
  const student = await prisma.student.findFirst({
    where: { userId: studentId },
  });

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">학생 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const exams = await getStudentExams(student.id);

  // 배정된 시험지만 필터링
  const assignedExams = exams.filter((exam) => exam.isAssigned);

  // 배정된 시험지를 완료/미완료로 분류
  const completedAssignedExams = assignedExams.filter((exam) => exam.isCompleted);
  const incompleteAssignedExams = assignedExams.filter((exam) => !exam.isCompleted);

  return (
    <div className="space-y-6 sm:space-y-12 lg:space-y-20 pb-8 sm:pb-16">
      {/* Page Header */}
      <div className="relative rounded-lg bg-white p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900">교사 지정 학습</h1>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-1 sm:mt-2">선생님이 배정한 시험지를 확인하세요</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <Card padding="md" className="!p-3 sm:!p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <AcademicCapIcon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm text-gray-600">미완료 시험지</div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">
                {incompleteAssignedExams.length}개
              </div>
            </div>
          </div>
        </Card>

        <Card padding="md" className="!p-3 sm:!p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm text-gray-600">완료한 시험지</div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">
                {completedAssignedExams.length}개
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 배정된 시험지 (미완료) */}
      {incompleteAssignedExams.length > 0 && (
        <div>
          <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            배정된 시험지
            <span className="text-xs sm:text-sm font-normal text-gray-500">
              ({incompleteAssignedExams.length}개)
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {incompleteAssignedExams.map((exam) => {
              const daysLeft = exam.dueDate
                ? Math.ceil(
                    (new Date(exam.dueDate).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;
              const isOverdue = daysLeft !== null && daysLeft < 0;

              return (
                <Link key={exam.id} href={`/student/exams/${exam.id}`}>
                  <Card
                    padding="md"
                    className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200 !p-3 sm:!p-4 active:bg-orange-50"
                  >
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-lg line-clamp-2">
                          {exam.title}
                        </h3>
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-100 text-orange-700 text-[10px] sm:text-xs rounded-full font-medium flex-shrink-0">
                          배정됨
                        </span>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs rounded">
                          {exam.category}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {exam.targetSchool} {exam.targetGrade}학년
                        </span>
                      </div>

                      {exam.dueDate && (
                        <div
                          className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                            isOverdue ? 'text-red-600' : 'text-gray-600'
                          }`}
                        >
                          <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>
                            {isOverdue
                              ? `${Math.abs(daysLeft!)}일 지남`
                              : daysLeft === 0
                              ? '오늘까지'
                              : `${daysLeft}일 남음`}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 완료한 시험지 */}
      {completedAssignedExams.length > 0 && (
        <div>
          <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            완료한 시험지
            <span className="text-xs sm:text-sm font-normal text-gray-500">
              ({completedAssignedExams.length}개)
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {completedAssignedExams.map((exam) => (
              <Link key={exam.id} href={`/student/exams/${exam.id}/result`}>
                <Card
                  padding="md"
                  className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 !p-3 sm:!p-4 active:bg-green-50"
                >
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-lg line-clamp-2">
                        {exam.title}
                      </h3>
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 text-[10px] sm:text-xs rounded-full font-medium flex-shrink-0">
                        완료
                      </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs rounded">
                        {exam.category}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-600">
                        {exam.targetSchool} {exam.targetGrade}학년
                      </span>
                    </div>

                    {exam.score !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">점수</span>
                        <span className="text-lg sm:text-2xl font-bold text-green-600">
                          {exam.score}점
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 배정된 시험지가 없을 때 */}
      {assignedExams.length === 0 && (
        <Card padding="lg" className="!p-6 sm:!p-8">
          <div className="text-center py-6 sm:py-12 text-gray-500">
            <AcademicCapIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
            <p className="text-sm sm:text-lg font-semibold">배정된 시험지가 없습니다.</p>
            <p className="text-xs sm:text-sm mt-1 sm:mt-2">선생님이 시험지를 배정하면 여기에 표시됩니다.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

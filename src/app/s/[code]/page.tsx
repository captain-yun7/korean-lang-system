import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { Card } from '@/components/ui';
import PassageContent from '@/components/PassageContent';
import { prisma } from '@/lib/prisma';
import { isValidShareCode } from '@/lib/share-code';
import TakeExamButton from './TakeExamButton';

interface Question {
  text: string;
  type: string;
  options?: string[];
}

interface ExamItem {
  passage?: string;
  questions: Question[];
}

// 정답·해설은 클라이언트로 내려보내지 않는다
async function getSharedExam(code: string) {
  if (!isValidShareCode(code)) return null;

  const exam = await prisma.exam.findUnique({
    where: { shareCode: code },
    select: {
      title: true,
      category: true,
      subcategory: true,
      targetSchool: true,
      targetGrade: true,
      items: true,
    },
  });

  if (!exam) return null;

  const items = (exam.items as unknown as ExamItem[]).map((item) => ({
    passage: item.passage ?? '',
    questions: (item.questions ?? []).map((question) => ({
      text: question.text,
      type: question.type,
      options: question.options ?? [],
    })),
  }));

  return { ...exam, items };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const exam = await getSharedExam(code);

  if (!exam) return { title: '시험지를 찾을 수 없습니다' };

  const description = `${exam.targetSchool} ${exam.targetGrade}학년 · ${exam.category} 시험지`;

  return {
    title: exam.title,
    description,
    openGraph: {
      title: exam.title,
      description,
      type: 'article',
    },
  };
}

export default async function SharedExamPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [exam, session] = await Promise.all([getSharedExam(code), auth()]);

  if (!exam) {
    notFound();
  }

  const role = session?.user?.role;

  const totalQuestions = exam.items.reduce(
    (sum, item) => sum + item.questions.length,
    0
  );

  let questionNumber = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900">
            <span className="text-purple-500">국어 학습</span> 시스템
          </Link>
          <span className="text-sm text-gray-500">공유된 시험지</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
              {exam.category}
            </span>
            {exam.subcategory && <span>{exam.subcategory}</span>}
            <span>
              {exam.targetSchool} {exam.targetGrade}학년
            </span>
            <span>•</span>
            <span>총 {totalQuestions}문항</span>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-800">
          {role === 'STUDENT'
            ? '미리보기 화면입니다. 아래 "지금 응시하기" 버튼을 누르면 답안을 제출할 수 있습니다.'
            : role === 'TEACHER'
              ? '미리보기 화면입니다. 학생이 이 링크를 열면 로그인 후 바로 응시할 수 있습니다.'
              : '미리보기 화면입니다. 정답과 해설은 표시되지 않으며, 답안을 제출할 수 없습니다. 실제로 응시하려면 로그인해주세요.'}
        </div>

        {exam.items.map((item, itemIndex) => (
          <Card key={itemIndex} padding="md">
            <div className="space-y-4">
              {item.passage && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    제시문
                  </div>
                  <PassageContent text={item.passage} className="text-gray-900" />
                </div>
              )}

              {item.questions.map((question, questionIndex) => {
                questionNumber += 1;

                return (
                  <div
                    key={questionIndex}
                    className="border-l-4 border-purple-400 pl-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {questionNumber}번
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {question.type}
                      </span>
                    </div>

                    <div className="text-gray-900 mb-3 whitespace-pre-wrap">
                      {question.text}
                    </div>

                    {question.options.length > 0 && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-start gap-2 p-2 rounded bg-gray-50"
                          >
                            <span className="font-medium text-gray-700 w-6">
                              {optionIndex + 1}.
                            </span>
                            <span className="text-gray-900">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          {role === 'STUDENT' ? (
            <>
              <p className="text-gray-700">
                응시를 시작하면 답안을 제출하고 채점 결과를 확인할 수 있습니다.
              </p>
              <TakeExamButton code={code} />
            </>
          ) : role === 'TEACHER' ? (
            <p className="text-gray-700">
              교사 계정으로 로그인되어 있습니다. 학생에게 이 링크를 공유해주세요.
            </p>
          ) : (
            <>
              <p className="text-gray-700">
                로그인하면 답안을 제출하고 채점 결과를 확인할 수 있습니다.
              </p>
              <Link
                href={`/?callbackUrl=${encodeURIComponent(`/s/${code}`)}`}
                className="inline-block mt-4 px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600"
              >
                로그인하고 응시하기
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

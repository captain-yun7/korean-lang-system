'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';

interface Question {
  id: string;
  passageId: string | null;
  type: string;
  text: string;
  options: string[] | null;
  answers: string[];
  explanation: string | null;
  wrongAnswerExplanations: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  passage: {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    difficulty: string;
  } | null;
  _count: {
    questionAnswers: number;
    assignedQuestions: number;
    wrongAnswers: number;
  };
}

interface QuestionAnswer {
  id: string;
  answer: string;
  isCorrect: boolean;
  result: {
    submittedAt: string;
    student: {
      name: string;
      grade: number;
      class: number;
      number: number;
    };
  };
}

interface Stats {
  totalAnswers: number;
  correctAnswers: number;
  correctRate: number;
}

interface Passage {
  id: string;
  title: string;
  category: string;
  subcategory: string;
}

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [recentAnswers, setRecentAnswers] = useState<QuestionAnswer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [passages, setPassages] = useState<Passage[]>([]);

  // 수정 폼 데이터
  const [formData, setFormData] = useState({
    passageId: '',
    type: '객관식',
    text: '',
    options: [] as string[],
    answers: [] as string[],
    explanation: '',
    wrongAnswerExplanations: {} as Record<string, string>,
  });

  useEffect(() => {
    fetchQuestion();
    fetchPassages();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teacher/questions/${id}`);
      if (!res.ok) throw new Error('Failed to fetch question');

      const data = await res.json();
      setQuestion(data.question);
      setRecentAnswers(data.recentAnswers);
      setStats(data.stats);

      // 폼 데이터 초기화
      setFormData({
        passageId: data.question.passageId || '',
        type: data.question.type,
        text: data.question.text,
        options: data.question.options || [],
        answers: data.question.answers,
        explanation: data.question.explanation || '',
        wrongAnswerExplanations: data.question.wrongAnswerExplanations || {},
      });
    } catch (error) {
      console.error('Error:', error);
      alert('문제 정보를 불러오는데 실패했습니다.');
      router.push('/teacher/questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPassages = async () => {
    try {
      const res = await fetch('/api/teacher/passages?limit=100');
      if (!res.ok) throw new Error('Failed to fetch passages');

      const data = await res.json();
      setPassages(data.passages);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/teacher/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passageId: formData.passageId || null,
          type: formData.type,
          text: formData.text.trim(),
          options:
            formData.type === '객관식'
              ? formData.options.filter((o) => o.trim())
              : null,
          answers: formData.answers.filter((a) => a.trim()),
          explanation: formData.explanation.trim() || null,
          wrongAnswerExplanations:
            Object.keys(formData.wrongAnswerExplanations).length > 0
              ? formData.wrongAnswerExplanations
              : null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '문제 수정에 실패했습니다.');
      }

      alert('문제가 수정되었습니다.');
      setIsEditing(false);
      fetchQuestion();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || '문제 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 문제를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/teacher/questions/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete question');

      alert('문제가 삭제되었습니다.');
      router.push('/teacher/questions');
    } catch (error) {
      console.error('Error:', error);
      alert('문제 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!question) return null;

  // 수정 모드
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">문제 수정</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <Card padding="md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              기본 정보
            </h2>
            <div className="space-y-4">
              {/* 연결된 지문 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연결된 지문
                </label>
                <select
                  value={formData.passageId}
                  onChange={(e) =>
                    setFormData({ ...formData, passageId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">독립 문제</option>
                  {passages.map((passage) => (
                    <option key={passage.id} value={passage.id}>
                      {passage.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* 문제 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  문제 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* 정답 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  정답 <span className="text-red-500">*</span>
                </label>
                {formData.answers.map((answer, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => {
                        const newAnswers = [...formData.answers];
                        newAnswers[index] = e.target.value;
                        setFormData({ ...formData, answers: newAnswers });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                ))}
              </div>

              {/* 정답 해설 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  정답 해설
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              취소
            </Button>
            <Button type="submit" variant="primary">
              수정 완료
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // 상세 모드
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">문제 상세</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            수정
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>
            목록
          </Button>
        </div>
      </div>

      {/* 기본 정보 */}
      <Card padding="md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
        <div className="space-y-3">
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 w-32">
              문제 유형
            </span>
            <span className="text-sm text-gray-900">{question.type}</span>
          </div>
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 w-32">
              연결된 지문
            </span>
            <span className="text-sm text-gray-900">
              {question.passage ? (
                <Link
                  href={`/teacher/passages/${question.passage.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {question.passage.title}
                </Link>
              ) : (
                '독립 문제'
              )}
            </span>
          </div>
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 w-32">
              등록일
            </span>
            <span className="text-sm text-gray-900">
              {new Date(question.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 w-32">
              최종 수정일
            </span>
            <span className="text-sm text-gray-900">
              {new Date(question.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* 문제 내용 */}
      <Card padding="md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">문제 내용</h2>
        <p className="text-gray-900 whitespace-pre-wrap">{question.text}</p>

        {/* 객관식 선택지 */}
        {question.type === '객관식' && question.options && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              선택지
            </h3>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sm text-gray-500">{index + 1}.</span>
                  <span className="text-sm text-gray-900">{option}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 정답 */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">정답</h3>
          <div className="flex gap-2">
            {question.answers.map((answer, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                {answer}
              </span>
            ))}
          </div>
        </div>

        {/* 정답 해설 */}
        {question.explanation && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              정답 해설
            </h3>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {question.explanation}
            </p>
          </div>
        )}
      </Card>

      {/* 통계 */}
      {stats && (
        <Card padding="md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            답변 통계
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAnswers}
              </p>
              <p className="text-sm text-gray-500">총 답변 수</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.correctAnswers}
              </p>
              <p className="text-sm text-gray-500">정답 수</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {stats.correctRate}%
              </p>
              <p className="text-sm text-gray-500">정답률</p>
            </div>
          </div>
        </Card>
      )}

      {/* 최근 답변 */}
      {recentAnswers.length > 0 && (
        <Card padding="md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            최근 답변 (10건)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    학생
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    답변
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    정답 여부
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    제출일시
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentAnswers.map((answer) => (
                  <tr key={answer.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {answer.result.student.name} (
                      {answer.result.student.grade}학년{' '}
                      {answer.result.student.class}반{' '}
                      {answer.result.student.number}번)
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {answer.answer}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          answer.isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {answer.isCorrect ? '정답' : '오답'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(
                        answer.result.submittedAt
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

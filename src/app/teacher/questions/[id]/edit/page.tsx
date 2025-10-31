'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Button } from '@/components/ui';

interface Passage {
  id: string;
  title: string;
  category: string;
  subcategory: string;
}

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // 문제 폼 데이터
  const [formData, setFormData] = useState({
    passageId: '',
    type: '객관식',
    text: '',
    options: ['', '', '', '', ''], // 기본 5개 선택지
    answers: [''],
    explanation: '',
    wrongAnswerExplanations: {} as Record<string, string>,
  });

  // 기존 문제 데이터 조회
  useEffect(() => {
    fetchQuestion();
    fetchPassages();
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      setDataLoading(true);
      const res = await fetch(`/api/teacher/questions/${questionId}`);
      if (!res.ok) throw new Error('Failed to fetch question');

      const data = await res.json();
      const question = data.question;

      setFormData({
        passageId: question.passageId || '',
        type: question.type,
        text: question.text,
        options: question.options || ['', '', '', '', ''],
        answers: question.answers || [''],
        explanation: question.explanation || '',
        wrongAnswerExplanations: question.wrongAnswerExplanations || {},
      });
    } catch (error) {
      console.error('Error:', error);
      alert('문제 정보를 불러오는데 실패했습니다.');
      router.push('/teacher/questions');
    } finally {
      setDataLoading(false);
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
      alert('지문 목록을 불러오는데 실패했습니다.');
    }
  };

  // 문제 유형 변경
  const handleTypeChange = (type: string) => {
    setFormData({
      ...formData,
      type,
      options: type === '객관식' ? formData.options.length > 0 ? formData.options : ['', '', '', '', ''] : [],
      wrongAnswerExplanations: type === '객관식' ? formData.wrongAnswerExplanations : {},
    });
  };

  // 선택지 추가
  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ''],
    });
  };

  // 선택지 삭제
  const handleRemoveOption = (index: number) => {
    if (formData.options.length <= 2) {
      alert('최소 2개 이상의 선택지가 필요합니다.');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  // 선택지 변경
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  // 정답 추가
  const handleAddAnswer = () => {
    setFormData({
      ...formData,
      answers: [...formData.answers, ''],
    });
  };

  // 정답 삭제
  const handleRemoveAnswer = (index: number) => {
    if (formData.answers.length <= 1) {
      alert('최소 1개 이상의 정답이 필요합니다.');
      return;
    }
    const newAnswers = formData.answers.filter((_, i) => i !== index);
    setFormData({ ...formData, answers: newAnswers });
  };

  // 정답 변경
  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData({ ...formData, answers: newAnswers });
  };

  // 오답 해설 변경
  const handleWrongAnswerExplanationChange = (
    optionIndex: number,
    value: string
  ) => {
    setFormData({
      ...formData,
      wrongAnswerExplanations: {
        ...formData.wrongAnswerExplanations,
        [optionIndex]: value,
      },
    });
  };

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.type || !formData.text.trim()) {
      alert('문제 유형과 내용을 입력해주세요.');
      return;
    }

    if (formData.answers.filter((a) => a.trim()).length === 0) {
      alert('정답을 입력해주세요.');
      return;
    }

    if (
      formData.type === '객관식' &&
      formData.options.filter((o) => o.trim()).length < 2
    ) {
      alert('객관식 문제는 최소 2개 이상의 선택지가 필요합니다.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/teacher/questions/${questionId}`, {
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
      router.push('/teacher/questions');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || '문제 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">문제 수정</h1>
        <p className="text-gray-600 mt-1">문제 정보를 수정하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card padding="md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            기본 정보
          </h2>
          <div className="space-y-4">
            {/* 연결된 지문 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연결된 지문 (선택사항)
              </label>
              <select
                value={formData.passageId}
                onChange={(e) =>
                  setFormData({ ...formData, passageId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">독립 문제 (지문 없음)</option>
                {passages.map((passage) => (
                  <option key={passage.id} value={passage.id}>
                    {passage.title} ({passage.category} /{' '}
                    {passage.subcategory})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                지문과 연결하지 않으면 독립 문제(문법/개념)로 등록됩니다.
              </p>
            </div>

            {/* 문제 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                문제 유형 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {['객관식', '단답형', '서술형'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="mr-2"
                    />
                    {type}
                  </label>
                ))}
              </div>
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
                placeholder="문제 내용을 입력하세요"
                required
              />
            </div>
          </div>
        </Card>

        {/* 객관식 선택지 */}
        {formData.type === '객관식' && (
          <Card padding="md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">선택지</h2>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddOption}
              >
                선택지 추가
              </Button>
            </div>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 w-8">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder={`선택지 ${index + 1}`}
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    {/* 오답 해설 */}
                    <div className="ml-10 mt-2">
                      <input
                        type="text"
                        value={formData.wrongAnswerExplanations[index] || ''}
                        onChange={(e) =>
                          handleWrongAnswerExplanationChange(
                            index,
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        placeholder="오답 해설 (선택사항)"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 정답 */}
        <Card padding="md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              정답 <span className="text-red-500">*</span>
            </h2>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddAnswer}
            >
              정답 추가 (복수 정답)
            </Button>
          </div>
          <div className="space-y-3">
            {formData.answers.map((answer, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={`정답 ${index + 1}`}
                  required
                />
                {formData.answers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAnswer(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            복수 정답이 있는 경우 여러 개의 정답을 추가할 수 있습니다.
          </p>
        </Card>

        {/* 정답 해설 */}
        <Card padding="md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            정답 해설 (선택사항)
          </h2>
          <textarea
            value={formData.explanation}
            onChange={(e) =>
              setFormData({ ...formData, explanation: e.target.value })
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="정답에 대한 해설을 입력하세요"
          />
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? '수정 중...' : '문제 수정'}
          </Button>
        </div>
      </form>
    </div>
  );
}

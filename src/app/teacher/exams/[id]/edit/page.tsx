'use client';

import { Card, Button } from '@/components/ui';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

// 영역 카테고리
const CATEGORIES = ['비문학', '문학', '문법', '어휘', '기타'];

const SCHOOL_LEVELS = ['중등', '고등'];
const GRADES = [1, 2, 3];

// 문항 인터페이스
interface Question {
  text: string;
  type: string;
  options: string[];
  answers: string[];
  explanation: string;
}

// 문항 그룹 (제시문 + 여러 질문)
interface ExamItem {
  passage: string; // 제시문 (선택사항)
  questions: Question[];
}

interface ExamFormData {
  title: string;
  category: string;
  targetSchool: string;
  targetGrade: number;
  items: ExamItem[];
}

export default function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ExamFormData>({
    title: '',
    category: '비문학',
    targetSchool: '중등',
    targetGrade: 1,
    items: [
      {
        passage: '',
        questions: [
          {
            text: '',
            type: '객관식',
            options: ['', '', '', '', ''],
            answers: [''],
            explanation: '',
          },
        ],
      },
    ],
  });

  // 기존 시험지 데이터 불러오기
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/teacher/exams/${id}`);
        const data = await response.json();

        if (response.ok) {
          setFormData({
            title: data.examPaper.title,
            category: data.examPaper.category,
            targetSchool: data.examPaper.targetSchool,
            targetGrade: data.examPaper.targetGrade,
            items: data.examPaper.items,
          });
        } else {
          alert('시험지를 불러오는데 실패했습니다.');
          router.push('/teacher/exams');
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        alert('시험지를 불러오는데 실패했습니다.');
        router.push('/teacher/exams');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, router]);

  // 문항 그룹 추가
  const addItemGroup = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          passage: '',
          questions: [
            {
              text: '',
              type: '객관식',
              options: ['', '', '', '', ''],
              answers: [''],
              explanation: '',
            },
          ],
        },
      ],
    });
  };

  // 문항 그룹 삭제
  const removeItemGroup = (itemIndex: number) => {
    if (formData.items.length <= 1) {
      alert('최소 1개 이상의 문항이 필요합니다.');
      return;
    }
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== itemIndex),
    });
  };

  // 제시문 변경
  const handlePassageChange = (itemIndex: number, value: string) => {
    const newItems = [...formData.items];
    newItems[itemIndex].passage = value;
    setFormData({ ...formData, items: newItems });
  };

  // 질문 추가 (같은 제시문에)
  const addQuestion = (itemIndex: number) => {
    const newItems = [...formData.items];
    newItems[itemIndex].questions.push({
      text: '',
      type: '객관식',
      options: ['', '', '', '', ''],
      answers: [''],
      explanation: '',
    });
    setFormData({ ...formData, items: newItems });
  };

  // 질문 삭제
  const removeQuestion = (itemIndex: number, questionIndex: number) => {
    const newItems = [...formData.items];
    if (newItems[itemIndex].questions.length <= 1) {
      alert('각 문항 그룹에는 최소 1개의 질문이 필요합니다.');
      return;
    }
    newItems[itemIndex].questions = newItems[itemIndex].questions.filter(
      (_, i) => i !== questionIndex
    );
    setFormData({ ...formData, items: newItems });
  };

  // 질문 내용 변경
  const handleQuestionChange = (
    itemIndex: number,
    questionIndex: number,
    field: keyof Question,
    value: any
  ) => {
    const newItems = [...formData.items];
    newItems[itemIndex].questions[questionIndex] = {
      ...newItems[itemIndex].questions[questionIndex],
      [field]: value,
    };
    setFormData({ ...formData, items: newItems });
  };

  // 선택지 추가
  const addOption = (itemIndex: number, questionIndex: number) => {
    const newItems = [...formData.items];
    newItems[itemIndex].questions[questionIndex].options.push('');
    setFormData({ ...formData, items: newItems });
  };

  // 선택지 삭제
  const removeOption = (
    itemIndex: number,
    questionIndex: number,
    optionIndex: number
  ) => {
    const newItems = [...formData.items];
    const options = newItems[itemIndex].questions[questionIndex].options;
    if (options.length <= 2) {
      alert('최소 2개의 선택지가 필요합니다.');
      return;
    }
    newItems[itemIndex].questions[questionIndex].options = options.filter(
      (_, i) => i !== optionIndex
    );
    setFormData({ ...formData, items: newItems });
  };

  // 선택지 변경
  const handleOptionChange = (
    itemIndex: number,
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newItems = [...formData.items];
    newItems[itemIndex].questions[questionIndex].options[optionIndex] = value;
    setFormData({ ...formData, items: newItems });
  };

  // 정답 추가
  const addAnswer = (itemIndex: number, questionIndex: number) => {
    const newItems = [...formData.items];
    newItems[itemIndex].questions[questionIndex].answers.push('');
    setFormData({ ...formData, items: newItems });
  };

  // 정답 삭제
  const removeAnswer = (
    itemIndex: number,
    questionIndex: number,
    answerIndex: number
  ) => {
    const newItems = [...formData.items];
    const answers = newItems[itemIndex].questions[questionIndex].answers;
    if (answers.length <= 1) {
      alert('최소 1개의 정답이 필요합니다.');
      return;
    }
    newItems[itemIndex].questions[questionIndex].answers = answers.filter(
      (_, i) => i !== answerIndex
    );
    setFormData({ ...formData, items: newItems });
  };

  // 정답 변경
  const handleAnswerChange = (
    itemIndex: number,
    questionIndex: number,
    answerIndex: number,
    value: string
  ) => {
    const newItems = [...formData.items];
    newItems[itemIndex].questions[questionIndex].answers[answerIndex] = value;
    setFormData({ ...formData, items: newItems });
  };

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.title.trim()) {
      setError('시험지 제목을 입력해주세요.');
      return;
    }

    // 각 문항 검사
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      for (let j = 0; j < item.questions.length; j++) {
        const question = item.questions[j];
        if (!question.text.trim()) {
          setError(`${i + 1}번 문항 그룹의 ${j + 1}번 질문을 입력해주세요.`);
          return;
        }
        if (question.answers.filter((a) => a.trim()).length === 0) {
          setError(`${i + 1}번 문항 그룹의 ${j + 1}번 질문의 정답을 입력해주세요.`);
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/teacher/exams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '시험지 수정에 실패했습니다.');
      }

      alert('시험지가 수정되었습니다.');
      router.push(`/teacher/exams/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || '시험지 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">시험지 수정</h1>
        <p className="text-gray-600 mt-1">시험지 내용을 수정하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* 기본 정보 */}
        <Card padding="md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
          <div className="space-y-4">
            {/* 시험지 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시험지 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="예: 2024년 11월 중간고사"
                required
              />
            </div>

            {/* 영역 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                영역 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center">
                    <input
                      type="radio"
                      value={cat}
                      checked={formData.category === cat}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="mr-2"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* 대상 설정 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  대상 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {SCHOOL_LEVELS.map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        value={level}
                        checked={formData.targetSchool === level}
                        onChange={(e) =>
                          setFormData({ ...formData, targetSchool: e.target.value })
                        }
                        className="mr-2"
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  대상 학년 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {GRADES.map((grade) => (
                    <label key={grade} className="flex items-center">
                      <input
                        type="radio"
                        value={grade}
                        checked={formData.targetGrade === grade}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetGrade: parseInt(e.target.value),
                          })
                        }
                        className="mr-2"
                      />
                      {grade}학년
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 문항 입력 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              문항 입력 (총 {formData.items.reduce((sum, item) => sum + item.questions.length, 0)}문항)
            </h2>
          </div>

          {formData.items.map((item, itemIndex) => (
            <Card key={itemIndex} padding="md">
              <div className="space-y-4">
                {/* 문항 그룹 헤더 */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    문항 그룹 {itemIndex + 1}
                  </h3>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemGroup(itemIndex)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      그룹 삭제
                    </button>
                  )}
                </div>

                {/* 제시문 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제시문 (선택사항)
                  </label>
                  <textarea
                    value={item.passage}
                    onChange={(e) => handlePassageChange(itemIndex, e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="제시문을 입력하세요 (비워두면 제시문 없는 문제)"
                  />
                </div>

                {/* 질문들 */}
                {item.questions.map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="p-4 bg-gray-50 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        문항 {itemIndex + 1}-{questionIndex + 1}
                      </h4>
                      {item.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(itemIndex, questionIndex)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          문항 삭제
                        </button>
                      )}
                    </div>

                    {/* 문제 유형 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        문제 유형
                      </label>
                      <div className="flex gap-4">
                        {['객관식', '단답형', '서술형'].map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="radio"
                              value={type}
                              checked={question.type === type}
                              onChange={(e) =>
                                handleQuestionChange(
                                  itemIndex,
                                  questionIndex,
                                  'type',
                                  e.target.value
                                )
                              }
                              className="mr-2"
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 질문 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        질문 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) =>
                          handleQuestionChange(
                            itemIndex,
                            questionIndex,
                            'text',
                            e.target.value
                          )
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="질문을 입력하세요"
                        required
                      />
                    </div>

                    {/* 객관식 선택지 */}
                    {question.type === '객관식' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            선택지
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(itemIndex, questionIndex)}
                            className="text-sm text-indigo-600 hover:text-indigo-700"
                          >
                            + 선택지 추가
                          </button>
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <span className="text-sm font-medium text-gray-700 w-8 pt-2">
                                {optionIndex + 1}.
                              </span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  handleOptionChange(
                                    itemIndex,
                                    questionIndex,
                                    optionIndex,
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                placeholder={`선택지 ${optionIndex + 1}`}
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeOption(itemIndex, questionIndex, optionIndex)
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 정답 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          정답 <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => addAnswer(itemIndex, questionIndex)}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          + 정답 추가 (복수 정답)
                        </button>
                      </div>
                      <div className="space-y-2">
                        {question.answers.map((answer, answerIndex) => (
                          <div key={answerIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={answer}
                              onChange={(e) =>
                                handleAnswerChange(
                                  itemIndex,
                                  questionIndex,
                                  answerIndex,
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                              placeholder={`정답 ${answerIndex + 1}`}
                              required
                            />
                            {question.answers.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeAnswer(itemIndex, questionIndex, answerIndex)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 해설 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        해설 (선택사항)
                      </label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) =>
                          handleQuestionChange(
                            itemIndex,
                            questionIndex,
                            'explanation',
                            e.target.value
                          )
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="정답 해설을 입력하세요"
                      />
                    </div>
                  </div>
                ))}

                {/* 같은 제시문에 질문 추가 */}
                <button
                  type="button"
                  onClick={() => addQuestion(itemIndex)}
                  className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                >
                  + 이 제시문에 문항 추가
                </button>
              </div>
            </Card>
          ))}

          {/* 문항 그룹 추가 */}
          <button
            type="button"
            onClick={addItemGroup}
            className="w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
          >
            + 새 문항 그룹 추가
          </button>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? '수정 중...' : '시험지 수정'}
          </Button>
        </div>
      </form>
    </div>
  );
}

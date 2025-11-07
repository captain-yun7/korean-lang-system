'use client';

import { Card, Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 영역 카테고리
const CATEGORIES = ['비문학', '문학', '문법', '어휘', '기타'];

const SCHOOL_LEVELS = ['중등', '고등'];
const GRADES = [1, 2, 3];

// 지문 인터페이스
interface Passage {
  id: string;
  title: string;
  category: string;
  schoolLevel: string;
  gradeLevel: number;
  contentBlocks: { para: string }[];
  createdAt: string;
}

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
  examType: string;
  isPublic: boolean;
  targetSchool: string;
  targetGrade: number;
  items: ExamItem[];
}

export default function NewExamPaperPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 지문 관련 상태
  const [passages, setPassages] = useState<Passage[]>([]);
  const [isPassageModalOpen, setIsPassageModalOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [passageFilter, setPassageFilter] = useState({
    category: '',
    schoolLevel: '',
    search: '',
  });

  const [formData, setFormData] = useState<ExamFormData>({
    title: '',
    category: '비문학',
    examType: 'ASSIGNED',
    isPublic: false,
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

  // 지문 목록 로드
  useEffect(() => {
    fetchPassages();
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPassageModalOpen) {
        setIsPassageModalOpen(false);
        setSelectedItemIndex(null);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isPassageModalOpen]);

  const fetchPassages = async () => {
    try {
      const response = await fetch('/api/teacher/passages');
      const data = await response.json();
      if (response.ok) {
        setPassages(data.passages || []);
      }
    } catch (error) {
      console.error('Failed to fetch passages:', error);
    }
  };

  // 지문 선택 모달 열기
  const openPassageModal = (itemIndex: number) => {
    setSelectedItemIndex(itemIndex);
    setIsPassageModalOpen(true);
  };

  // 지문 선택 및 적용
  const selectPassage = (passage: Passage) => {
    if (selectedItemIndex === null) return;

    // contentBlocks의 모든 para를 합쳐서 하나의 문자열로
    const passageText = passage.contentBlocks
      .map((block) => block.para)
      .join('\n\n');

    handlePassageChange(selectedItemIndex, passageText);
    setIsPassageModalOpen(false);
    setSelectedItemIndex(null);
  };

  // 필터링된 지문 목록
  const filteredPassages = passages.filter((passage) => {
    if (passageFilter.category && passage.category !== passageFilter.category) {
      return false;
    }
    if (
      passageFilter.schoolLevel &&
      passage.schoolLevel !== passageFilter.schoolLevel
    ) {
      return false;
    }
    if (
      passageFilter.search &&
      !passage.title.toLowerCase().includes(passageFilter.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

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
      const response = await fetch('/api/teacher/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '시험지 등록에 실패했습니다.');
      }

      alert('시험지가 등록되었습니다.');
      router.push('/teacher/exams');
      router.refresh();
    } catch (err: any) {
      setError(err.message || '시험지 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">시험지 등록</h1>
        <p className="text-gray-600 mt-1">새로운 시험지를 만들어 학생들에게 배정하세요</p>
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

            {/* 시험지 타입 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시험지 타입 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ASSIGNED"
                    checked={formData.examType === 'ASSIGNED'}
                    onChange={(e) =>
                      setFormData({ ...formData, examType: e.target.value, isPublic: false })
                    }
                    className="mr-2"
                  />
                  배정용 (교사가 학생에게 배정)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="SELF_STUDY"
                    checked={formData.examType === 'SELF_STUDY'}
                    onChange={(e) =>
                      setFormData({ ...formData, examType: e.target.value, isPublic: true })
                    }
                    className="mr-2"
                  />
                  자습용 (학생이 스스로 선택)
                </label>
              </div>
              {formData.examType === 'SELF_STUDY' && (
                <p className="text-sm text-blue-600 mt-2">
                  자습용 시험지는 모든 학생에게 공개됩니다.
                </p>
              )}
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      제시문 (선택사항)
                    </label>
                    <button
                      type="button"
                      onClick={() => openPassageModal(itemIndex)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      지문 불러오기
                    </button>
                  </div>
                  <textarea
                    value={item.passage}
                    onChange={(e) => handlePassageChange(itemIndex, e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        {['객관식', 'OX', '단답형', '서술형'].map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="radio"
                              value={type}
                              checked={question.type === type}
                              onChange={(e) => {
                                const newType = e.target.value;
                                handleQuestionChange(
                                  itemIndex,
                                  questionIndex,
                                  'type',
                                  newType
                                );
                                // OX 문제로 변경 시 options를 ['O', 'X']로 설정
                                if (newType === 'OX') {
                                  const newItems = [...formData.items];
                                  newItems[itemIndex].questions[questionIndex].options = ['O', 'X'];
                                  setFormData({ ...formData, items: newItems });
                                }
                              }}
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

                    {/* 객관식/OX 선택지 */}
                    {(question.type === '객관식' || question.type === 'OX') && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            선택지
                            {question.type === 'OX' && (
                              <span className="text-sm font-normal text-gray-500 ml-2">(OX 문제는 O와 X가 고정됩니다)</span>
                            )}
                          </label>
                          {question.type !== 'OX' && (
                            <button
                              type="button"
                              onClick={() => addOption(itemIndex, questionIndex)}
                              className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                              + 선택지 추가
                            </button>
                          )}
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
                                readOnly={question.type === 'OX'}
                                disabled={question.type === 'OX'}
                              />
                              {question.type !== 'OX' && question.options.length > 2 && (
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
            {isLoading ? '등록 중...' : '시험지 등록'}
          </Button>
        </div>
      </form>

      {/* 지문 선택 모달 */}
      {isPassageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* 모달 헤더 */}
            <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <div>
                    <h2 className="text-2xl font-bold">지문 불러오기</h2>
                    <p className="text-blue-100 text-sm">등록된 지문 중에서 선택하세요</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsPassageModalOpen(false);
                    setSelectedItemIndex(null);
                  }}
                  className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-red-50 transition-all shadow-md hover:shadow-lg group"
                  title="닫기"
                >
                  <svg
                    className="w-6 h-6 text-gray-700 group-hover:text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 필터 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    영역
                  </label>
                  <select
                    value={passageFilter.category}
                    onChange={(e) =>
                      setPassageFilter({ ...passageFilter, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border-2 border-white border-opacity-40 rounded-lg text-gray-900 focus:border-opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  >
                    <option value="">전체</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    학교급
                  </label>
                  <select
                    value={passageFilter.schoolLevel}
                    onChange={(e) =>
                      setPassageFilter({
                        ...passageFilter,
                        schoolLevel: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white border-2 border-white border-opacity-40 rounded-lg text-gray-900 focus:border-opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  >
                    <option value="">전체</option>
                    {SCHOOL_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    검색
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={passageFilter.search}
                      onChange={(e) =>
                        setPassageFilter({ ...passageFilter, search: e.target.value })
                      }
                      placeholder="제목 검색..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-white border-opacity-40 rounded-lg text-gray-900 placeholder-gray-400 focus:border-opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    />
                    <svg
                      className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {filteredPassages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">등록된 지문이 없습니다</p>
                  <p className="text-sm text-gray-400 mt-1">필터 조건을 변경해보세요</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">
                      총 <span className="font-semibold text-indigo-600">{filteredPassages.length}개</span>의 지문
                    </p>
                  </div>
                  {filteredPassages.map((passage) => (
                    <div
                      key={passage.id}
                      onClick={() => selectPassage(passage)}
                      className="group p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                              {passage.title}
                            </h3>
                            <div className="ml-4 w-8 h-8 rounded-full bg-indigo-100 group-hover:bg-indigo-600 flex items-center justify-center transition-colors flex-shrink-0">
                              <svg
                                className="w-4 h-4 text-indigo-600 group-hover:text-white transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="flex gap-2 mb-3">
                            <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                              {passage.category}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                              {passage.schoolLevel} {passage.gradeLevel}학년
                            </span>
                            <span className="inline-flex items-center text-gray-500 text-xs">
                              {new Date(passage.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {passage.contentBlocks
                              .map((block) => block.para)
                              .join(' ')
                              .substring(0, 200)}
                            ...
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 border-t border-gray-200 bg-white flex justify-between items-center">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span>지문을 클릭하면 제시문에 자동으로 입력됩니다</span>
                <span className="text-gray-400">|</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                  ESC
                </kbd>
                <span className="text-gray-400">로 닫기</span>
              </p>
              <button
                onClick={() => {
                  setIsPassageModalOpen(false);
                  setSelectedItemIndex(null);
                }}
                className="px-8 py-3 text-white bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg hover:from-gray-700 hover:to-gray-800 font-semibold transition-all shadow-md hover:shadow-lg"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

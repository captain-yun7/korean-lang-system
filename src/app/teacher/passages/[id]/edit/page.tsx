'use client';

import { Card } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// 카테고리 및 서브카테고리 정의 (지문은 비문학/문학만)
const CATEGORIES = {
  비문학: ['인문예술', '과학기술', '사회문화'],
  문학: ['고전산문', '고전시가', '현대산문', '현대시'],
};

const DIFFICULTIES = ['중학교', '고1-2', '고3'];

interface ContentBlock {
  para: string;
}

interface PassageFormData {
  title: string;
  category: string;
  subcategory: string;
  difficulty: string;
  contentBlocks: ContentBlock[];
}

export default function EditPassagePage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<PassageFormData>({
    title: '',
    category: '비문학',
    subcategory: '인문예술',
    difficulty: '중학교',
    contentBlocks: [
      { para: '' },
    ],
  });

  // 지문 데이터 불러오기
  useEffect(() => {
    const fetchPassage = async () => {
      try {
        const response = await fetch(`/api/teacher/passages/${params.id}`);
        if (!response.ok) {
          throw new Error('지문을 불러오지 못했습니다.');
        }
        const data = await response.json();
        const passage = data.passage;

        setFormData({
          title: passage.title,
          category: passage.category,
          subcategory: passage.subcategory,
          difficulty: passage.difficulty,
          contentBlocks: passage.contentBlocks as ContentBlock[],
        });
      } catch (err: any) {
        setError(err.message || '지문을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPassage();
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // 카테고리 변경 시 서브카테고리도 초기화
    if (name === 'category') {
      const subcategories = CATEGORIES[value as keyof typeof CATEGORIES];
      setFormData((prev) => ({
        ...prev,
        category: value,
        subcategory: subcategories[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBlockChange = (
    index: number,
    field: keyof ContentBlock,
    value: string
  ) => {
    setFormData((prev) => {
      const newBlocks = [...prev.contentBlocks];
      newBlocks[index] = {
        ...newBlocks[index],
        [field]: value,
      };
      return { ...prev, contentBlocks: newBlocks };
    });
  };

  const addBlock = () => {
    setFormData((prev) => ({
      ...prev,
      contentBlocks: [
        ...prev.contentBlocks,
        { para: '' },
      ],
    }));
  };

  const removeBlock = (index: number) => {
    if (formData.contentBlocks.length > 1) {
      setFormData((prev) => ({
        ...prev,
        contentBlocks: prev.contentBlocks.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 필수 필드 확인
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    // 최소 1개의 문단 필요
    if (formData.contentBlocks.length === 0) {
      setError('최소 1개의 문단이 필요합니다.');
      return;
    }

    // 모든 문단의 필수 필드 확인
    for (let i = 0; i < formData.contentBlocks.length; i++) {
      const block = formData.contentBlocks[i];
      if (!block.para.trim()) {
        setError(`${i + 1}번째 문단의 내용을 입력해주세요.`);
        return;
      }
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/teacher/passages/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '지문 수정에 실패했습니다.');
      }

      // 성공 시 지문 상세 페이지로 이동
      router.push(`/teacher/passages/${params.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || '지문 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const subcategories = CATEGORIES[formData.category as keyof typeof CATEGORIES] || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">지문 수정</h1>
        <p className="text-gray-600 mt-1">지문 정보를 수정하세요</p>
      </div>

      <Card>
        <Card.Body className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* 기본 정보 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>

              {/* 제목 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="예: 현대시의 이해"
                />
              </div>

              {/* 카테고리, 서브카테고리, 난이도 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.keys(CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="subcategory"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    세부 분류 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {subcategories.map((subcat) => (
                      <option key={subcat} value={subcat}>
                        {subcat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="difficulty"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    난이도 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {DIFFICULTIES.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 지문 내용 (문단별) */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">지문 내용</h2>

              {formData.contentBlocks.map((block, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">문단 {index + 1}</h3>
                    {formData.contentBlocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBlock(index)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  {/* 문단 내용 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      문단 내용 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={block.para}
                      onChange={(e) => handleBlockChange(index, 'para', e.target.value)}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="문단 내용을 입력하세요"
                    />
                  </div>
                </div>
              ))}

              {/* 문단 추가 버튼 */}
              <button
                type="button"
                onClick={addBlock}
                className="w-full px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
              >
                + 문단 추가
              </button>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSaving ? '저장 중...' : '수정 완료'}
              </button>
              <Link
                href={`/teacher/passages/${params.id}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                취소
              </Link>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}

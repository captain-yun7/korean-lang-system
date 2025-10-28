'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 카테고리 및 하위 카테고리
const CATEGORIES = {
  비문학: ['인문예술', '과학기술', '사회문화'],
  문학: ['고전산문', '고전시가', '현대산문', '현대시'],
  문법: ['품사', '단어의 형성', '음운 변동', '문장', '한글맞춤법', '중세 국어'],
};

const DIFFICULTIES = ['중학교', '고1-2', '고3'];

interface Passage {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  difficulty: string;
  _count: {
    questions: number;
  };
}

export default function SelfStudyPage() {
  const router = useRouter();
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(false);

  // 필터
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPassages();
  }, [selectedCategory, selectedSubcategory, selectedDifficulty]);

  const fetchPassages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSubcategory) params.append('subcategory', selectedSubcategory);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/student/passages?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch passages');

      const data = await res.json();
      setPassages(data.passages);
    } catch (error) {
      console.error('Error:', error);
      alert('지문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPassages();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
  };

  const handleRandomSelect = () => {
    if (passages.length === 0) {
      alert('선택 가능한 지문이 없습니다.');
      return;
    }
    const randomIndex = Math.floor(Math.random() * passages.length);
    const randomPassage = passages[randomIndex];
    router.push(`/student/study/reading/${randomPassage.id}`);
  };

  const subcategories = selectedCategory
    ? CATEGORIES[selectedCategory as keyof typeof CATEGORIES] || []
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">스스로 학습</h1>
        <p className="text-gray-600 mt-1">원하는 지문을 선택하여 학습하세요</p>
      </div>

      {/* 필터 */}
      <Card>
        <Card.Body className="p-6">
          <div className="space-y-4">
            {/* 검색 */}
            <form onSubmit={handleSearch}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                지문 검색
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="지문 제목을 검색..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  검색
                </button>
              </div>
            </form>

            {/* 카테고리 필터 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">전체</option>
                  {Object.keys(CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  세부 카테고리
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={!selectedCategory}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">전체</option>
                  {subcategories.map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  난이도
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">전체</option>
                  {DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleRandomSelect}
                  disabled={passages.length === 0}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  랜덤 선택
                </button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* 지문 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">지문을 불러오는 중...</p>
        </div>
      ) : passages.length === 0 ? (
        <Card>
          <Card.Body className="p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900">
              지문이 없습니다
            </h3>
            <p className="text-gray-600 mt-2">
              다른 필터 조건을 선택해보세요
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {passages.map((passage) => (
            <Link
              key={passage.id}
              href={`/student/study/reading/${passage.id}`}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <Card.Body className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {passage.title}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {passage.category}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        {passage.subcategory}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {passage.difficulty}
                      </span>
                      <span className="text-gray-500">
                        문제 {passage._count.questions}개
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

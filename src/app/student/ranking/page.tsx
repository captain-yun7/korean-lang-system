'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';

interface RankingStudent {
  rank: number;
  grade: number;
  class: number;
  number: number;
  averageScore: number;
  totalResults: number;
  isMe?: boolean;
}

interface MyRank {
  rank: number;
  name: string;
  grade: number;
  class: number;
  number: number;
  averageScore: number;
  totalResults: number;
}

interface RankingData {
  type: string;
  totalStudents: number;
  top5: RankingStudent[];
  myRank: MyRank | null;
}

export default function RankingPage() {
  const [rankingType, setRankingType] = useState<'class' | 'grade' | 'all'>('class');
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, [rankingType]);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/ranking?type=${rankingType}`);
      if (!res.ok) throw new Error('Failed to fetch ranking');

      const data = await res.json();
      setRankingData(data);
    } catch (error) {
      console.error('Error:', error);
      alert('순위를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getRankingTitle = () => {
    if (!rankingData?.myRank) return '순위';
    const { grade, class: classNum } = rankingData.myRank;

    switch (rankingType) {
      case 'class':
        return `${grade}학년 ${classNum}반 순위`;
      case 'grade':
        return `${grade}학년 순위`;
      case 'all':
        return '전체 순위';
      default:
        return '순위';
    }
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🏅';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">순위를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">순위</h1>
        <p className="text-gray-600 mt-1">반, 학년, 전체 순위를 확인하세요</p>
      </div>

      {/* 탭 선택 */}
      <Card>
        <Card.Body className="p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRankingType('class')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                rankingType === 'class'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              반별 순위
            </button>
            <button
              onClick={() => setRankingType('grade')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                rankingType === 'grade'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              학년별 순위
            </button>
            <button
              onClick={() => setRankingType('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                rankingType === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체 순위
            </button>
          </div>
        </Card.Body>
      </Card>

      {/* 내 순위 */}
      {rankingData?.myRank ? (
        <Card>
          <Card.Header className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-lg font-semibold text-gray-900">내 순위</h2>
          </Card.Header>
          <Card.Body className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl mb-2">{getMedalEmoji(rankingData.myRank.rank)}</div>
                  <p className="text-3xl font-bold text-indigo-600">
                    {rankingData.myRank.rank}위
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    / {rankingData.totalStudents}명
                  </p>
                </div>
                <div className="h-16 w-px bg-gray-300" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {rankingData.myRank.name}
                  </p>
                  <p className="text-gray-600">
                    {rankingData.myRank.grade}학년 {rankingData.myRank.class}반{' '}
                    {rankingData.myRank.number}번
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">평균 점수</p>
                <p className="text-4xl font-bold text-green-600">
                  {rankingData.myRank.averageScore}점
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  총 {rankingData.myRank.totalResults}회 학습
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900">아직 학습 기록이 없습니다</h3>
            <p className="text-gray-600 mt-2">
              학습을 완료하면 순위에 등록됩니다. 지금 바로 시작해보세요!
            </p>
          </Card.Body>
        </Card>
      )}

      {/* 상위 5명 */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">{getRankingTitle()} - TOP 5</h2>
        </Card.Header>
        <Card.Body className="p-0">
          {rankingData?.top5 && rankingData.top5.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {rankingData.top5.map((student, index) => (
                <div
                  key={index}
                  className={`p-6 transition-colors ${
                    student.isMe ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-center w-20">
                        <div className="text-4xl mb-1">{getMedalEmoji(student.rank)}</div>
                        <p className="text-2xl font-bold text-gray-900">{student.rank}위</p>
                      </div>
                      <div className="h-12 w-px bg-gray-300" />
                      <div>
                        {student.isMe ? (
                          <p className="text-lg font-semibold text-indigo-600 mb-1">
                            나 ({rankingData.myRank?.name})
                          </p>
                        ) : (
                          <p className="text-lg font-semibold text-gray-500 mb-1">익명</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {student.grade}학년 {student.class}반 {student.number}번
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">평균 점수</p>
                      <p
                        className={`text-3xl font-bold ${
                          student.rank === 1
                            ? 'text-yellow-600'
                            : student.rank === 2
                            ? 'text-gray-500'
                            : student.rank === 3
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {student.averageScore}점
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {student.totalResults}회 학습
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold text-gray-900">
                아직 순위 정보가 없습니다
              </h3>
              <p className="text-gray-600 mt-2">학습을 완료한 학생이 없습니다.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* 안내 메시지 */}
      <Card>
        <Card.Body className="p-4 bg-blue-50 border-l-4 border-blue-600">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">순위 안내</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 순위는 평균 점수를 기준으로 산정됩니다.</li>
                <li>
                  • 상위 5등까지는 익명으로 표시되며, 본인 순위만 이름이 표시됩니다.
                </li>
                <li>• 평균 점수가 같을 경우 학습 횟수가 많은 순으로 순위가 결정됩니다.</li>
                <li>• 학습 기록이 없으면 순위에 포함되지 않습니다.</li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

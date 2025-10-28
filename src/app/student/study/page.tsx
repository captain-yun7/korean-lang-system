import Link from 'next/link';
import { Card } from '@/components/ui';

export default function StudentStudyPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">학습하기</h1>
        <p className="text-gray-600 mt-1">학습 방법을 선택하세요</p>
      </div>

      {/* 학습 방법 선택 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 스스로 학습 */}
        <Link href="/student/study/self">
          <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-indigo-500">
            <Card.Body className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">스스로 학습</h2>
                <p className="text-gray-600 mb-4">
                  원하는 지문을 직접 선택하여 학습할 수 있습니다.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">비문학, 문학, 문법 중 선택</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">난이도별 필터링</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">랜덤 지문 선택 가능</span>
                  </div>
                </div>
                <div className="mt-6">
                  <span className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
                    시작하기
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Link>

        {/* 교사 지정 학습 */}
        <Link href="/student/study/assigned">
          <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-green-500">
            <Card.Body className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">👨‍🏫</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">교사 지정 학습</h2>
                <p className="text-gray-600 mb-4">
                  선생님이 배정한 과제를 확인하고 학습할 수 있습니다.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">과제 마감일 확인</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">완료 상태 자동 추적</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">마감 임박 알림</span>
                  </div>
                </div>
                <div className="mt-6">
                  <span className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
                    과제 확인하기
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Link>

        {/* 문법 학습 (준비 중) */}
        <Card className="h-full border-2 border-gray-300 opacity-60">
          <Card.Body className="p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📖</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">문법 학습</h2>
              <p className="text-gray-600 mb-4">
                문법/개념 문제를 풀어볼 수 있습니다.
              </p>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">품사, 단어의 형성 등</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">즉시 채점 및 해설</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">오답 자동 저장</span>
                </div>
              </div>
              <div className="mt-6">
                <span className="inline-block px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed">
                  준비 중
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* 카테고리 안내 */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">학습 카테고리 안내</h3>
        </Card.Header>
        <Card.Body className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 비문학 */}
            <div>
              <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                <span className="text-xl">📘</span>
                비문학
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">•</span>
                  인문예술
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">•</span>
                  과학기술
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">•</span>
                  사회문화
                </li>
              </ul>
            </div>

            {/* 문학 */}
            <div>
              <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                <span className="text-xl">📕</span>
                문학
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">•</span>
                  고전산문
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">•</span>
                  고전시가
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">•</span>
                  현대산문
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">•</span>
                  현대시
                </li>
              </ul>
            </div>

            {/* 문법 */}
            <div>
              <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <span className="text-xl">📗</span>
                문법
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  품사
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  단어의 형성
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  음운 변동
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  문장
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  한글맞춤법
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  중세 국어
                </li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

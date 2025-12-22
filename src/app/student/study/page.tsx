import Link from 'next/link';
import { Card } from '@/components/ui';
import {
  BookOpenIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';

export default function StudentStudyPage() {
  return (
    <div className="space-y-6 sm:space-y-12 lg:space-y-20 pb-8 sm:pb-16">
      {/* Page Header */}
      <div className="relative rounded-lg bg-white p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900">학습하기</h1>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-1 sm:mt-2">원하는 학습 방법을 선택하세요</p>
      </div>

      {/* 학습 방법 선택 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 스스로 학습 */}
        <Link href="/student/study/self">
          <div className="h-full">
            <div className="rounded-lg bg-purple-500 p-4 sm:p-6 lg:p-8 text-white transform transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl border-2 border-gray-900 h-full">
              <div className="text-center">
                <BookOpenIcon className="w-10 h-10 sm:w-12 lg:w-16 sm:h-12 lg:h-16 mx-auto mb-3 sm:mb-4" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3">스스로 학습</h2>
                <p className="text-white/90 mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">
                  원하는 지문을 직접 선택하여 학습할 수 있습니다.
                </p>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-left">
                  <div className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">비문학, 문학, 문법 중 선택</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">난이도별 필터링</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">랜덤 지문 선택 가능</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6">
                  <span className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-600 rounded-lg font-bold text-sm sm:text-base group-hover:shadow-xl transition-shadow">
                    시작하기 <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* 교사 지정 학습 */}
        <Link href="/student/exams">
          <div className="h-full">
            <div className="rounded-lg bg-purple-500 p-4 sm:p-6 lg:p-8 text-white transform transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl border-2 border-gray-900 h-full">
              <div className="text-center">
                <AcademicCapIcon className="w-10 h-10 sm:w-12 lg:w-16 sm:h-12 lg:h-16 mx-auto mb-3 sm:mb-4" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3">교사 지정 학습</h2>
                <p className="text-white/90 mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">
                  선생님이 배정한 시험지를 풀어볼 수 있습니다.
                </p>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-left">
                  <div className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">시험 마감일 확인</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">완료 상태 자동 추적</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">마감 임박 알림</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6">
                  <span className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-600 rounded-lg font-bold text-sm sm:text-base">
                    시험 확인하기 <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* 문법 학습 */}
        <Link href="/student/study/grammar" className="sm:col-span-2 lg:col-span-1">
          <div className="h-full">
            <div className="rounded-lg bg-purple-500 p-4 sm:p-6 lg:p-8 text-white transform transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl border-2 border-gray-900 h-full">
              <div className="text-center">
                <DocumentTextIcon className="w-10 h-10 sm:w-12 lg:w-16 sm:h-12 lg:h-16 mx-auto mb-3 sm:mb-4" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3">문법 학습</h2>
                <p className="text-white/90 mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">
                  문법/개념 문제를 풀어볼 수 있습니다.
                </p>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-left">
                  <div className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">지문 없이 문제만 풀기</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">즉시 채점 및 해설</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">오답 자동 저장</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6">
                  <span className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-600 rounded-lg font-bold text-sm sm:text-base">
                    시작하기 <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* 카테고리 안내 */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          학습 카테고리 안내
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* 비문학 */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow border-2 border-blue-200">
            <h4 className="font-bold text-blue-600 text-sm sm:text-lg mb-3 sm:mb-4">
              비문학
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-blue-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500"></div>
                인문예술
              </li>
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-blue-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500"></div>
                과학기술
              </li>
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-blue-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500"></div>
                사회문화
              </li>
            </ul>
          </div>

          {/* 문학 */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow border-2 border-purple-200">
            <h4 className="font-bold text-purple-600 text-sm sm:text-lg mb-3 sm:mb-4">
              문학
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-purple-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500"></div>
                고전산문
              </li>
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-purple-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500"></div>
                고전시가
              </li>
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-purple-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500"></div>
                현대산문
              </li>
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-purple-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500"></div>
                현대시
              </li>
            </ul>
          </div>

          {/* 문법 */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow border-2 border-green-200">
            <h4 className="font-bold text-green-600 text-sm sm:text-lg mb-3 sm:mb-4">
              문법
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-green-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500"></div>
                품사
              </li>
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-green-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500"></div>
                단어의 형성
              </li>
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-green-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500"></div>
                음운 변동
              </li>
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-green-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500"></div>
                문장
              </li>
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-green-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500"></div>
                한글맞춤법
              </li>
              <li className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-green-50">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500"></div>
                중세 국어
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

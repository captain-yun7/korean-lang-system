'use client';

import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface GradingToggleButtonProps {
  resultId: string;
  itemIndex: number;
  questionIndex: number;
  isCorrect: boolean;
  questionNumber: number;
}

export default function GradingToggleButton({
  resultId,
  itemIndex,
  questionIndex,
  isCorrect,
  questionNumber,
}: GradingToggleButtonProps) {
  const [currentIsCorrect, setCurrentIsCorrect] = useState(isCorrect);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    const newIsCorrect = !currentIsCorrect;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/teacher/results/${resultId}/update-grading`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemIndex,
          questionIndex,
          isCorrect: newIsCorrect,
        }),
      });

      if (!response.ok) {
        throw new Error('채점 수정에 실패했습니다.');
      }

      setCurrentIsCorrect(newIsCorrect);

      // 페이지 새로고침 (점수 업데이트 반영)
      window.location.reload();
    } catch (error) {
      console.error('Error updating grading:', error);
      alert('채점 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* 현재 채점 결과 */}
      {currentIsCorrect ? (
        <div className="flex items-center gap-1 text-green-600 font-semibold">
          <CheckCircleIcon className="w-5 h-5" />
          정답
        </div>
      ) : (
        <div className="flex items-center gap-1 text-red-600 font-semibold">
          <XCircleIcon className="w-5 h-5" />
          오답
        </div>
      )}

      {/* 채점 변경 버튼 */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          currentIsCorrect
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={currentIsCorrect ? '오답으로 변경' : '정답으로 변경'}
      >
        {isLoading
          ? '처리중...'
          : currentIsCorrect
          ? '오답으로 변경'
          : '정답으로 변경'}
      </button>
    </div>
  );
}

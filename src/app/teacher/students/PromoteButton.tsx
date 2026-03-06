'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PromoteButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePromote = async () => {
    const confirmed = window.confirm(
      '정말 학년 일괄 진급을 실행하시겠습니까?\n\n' +
      '• 1학년 → 2학년\n' +
      '• 2학년 → 3학년\n' +
      '• 3학년 → 졸업(비활성화)\n\n' +
      '이 작업은 되돌릴 수 없습니다.'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/teacher/students/promote', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '학년 진급에 실패했습니다.');
      }

      alert(
        `학년 진급 완료!\n\n` +
        `• 1학년 → 2학년: ${data.details['1학년 → 2학년']}명\n` +
        `• 2학년 → 3학년: ${data.details['2학년 → 3학년']}명\n` +
        `• 3학년 졸업: ${data.details['3학년 졸업(비활성화)']}명`
      );
      router.refresh();
    } catch (error: any) {
      alert(error.message || '학년 진급에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePromote}
      disabled={loading}
      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50"
    >
      {loading ? '진급 중...' : '일괄 진급'}
    </button>
  );
}

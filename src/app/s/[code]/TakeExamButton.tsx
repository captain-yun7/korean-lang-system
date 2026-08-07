'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TakeExamButton({ code }: { code: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/student/exams/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? '응시 준비에 실패했습니다. 다시 시도해주세요.');
        setLoading(false);
        return;
      }

      router.push(`/student/exams/${data.examId}`);
    } catch {
      setError('응시 준비에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-block mt-4 px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '준비 중...' : '지금 응시하기'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

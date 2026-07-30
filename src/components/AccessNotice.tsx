'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ROLE_MISMATCH_NOTICE } from '@/lib/redirect';

const messages: Record<string, string> = {
  [ROLE_MISMATCH_NOTICE]:
    '요청하신 주소는 현재 계정으로 열 수 없는 화면이라 대시보드로 이동했습니다. 시험지를 공유받으셨다면 공유 링크(/s/ 로 시작하는 주소)를 다시 받아주세요.',
};

function AccessNoticeContent() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const message = messages[searchParams.get('notice') ?? ''];

  if (!message || dismissed) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="flex-1 text-sm text-amber-900">{message}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 text-sm font-medium text-amber-700 hover:text-amber-900"
        aria-label="안내 닫기"
      >
        닫기
      </button>
    </div>
  );
}

export default function AccessNotice() {
  return (
    <Suspense fallback={null}>
      <AccessNoticeContent />
    </Suspense>
  );
}

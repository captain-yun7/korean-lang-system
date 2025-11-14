'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function StudentLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/',
      redirect: true
    });
    // 로그아웃 후 상태 클리어
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      로그아웃
    </button>
  );
}

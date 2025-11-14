'use client';

import { signOut } from 'next-auth/react';

export default function StudentLogoutButton() {
  const handleLogout = async () => {
    // 로그아웃 후 완전히 페이지 새로고침하여 세션 완전 클리어
    await signOut({ redirect: false });
    window.location.href = '/';
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

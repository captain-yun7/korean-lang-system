'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface StudentMobileNavProps {
  navItems: NavItem[];
}

export default function StudentMobileNav({ navItems }: StudentMobileNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/student/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // 시험 응시 중에는 하단 네비게이션 숨김
  const isExamInProgress = /^\/student\/exams\/[^/]+$/.test(pathname) &&
    !pathname.endsWith('/result');

  if (isExamInProgress) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 px-1 transition-colors ${
              isActive(item.href)
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-purple-500'
            }`}
          >
            <div className={`${isActive(item.href) ? 'scale-110' : ''} transition-transform`}>
              {item.icon}
            </div>
            <span className={`text-xs mt-1 font-medium ${isActive(item.href) ? 'text-purple-600' : ''}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

import { ReactNode } from 'react';

interface MobileOptimizedProps {
  children: ReactNode;
  className?: string;
}

export default function MobileOptimized({ children, className = '' }: MobileOptimizedProps) {
  return (
    <div className={`
      touch-manipulation
      ${className}
    `}>
      {children}
    </div>
  );
}
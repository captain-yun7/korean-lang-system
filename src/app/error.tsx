'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-red-100 rounded-full">
          <svg 
            className="w-8 h-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          문제가 발생했습니다
        </h1>
        
        <p className="text-gray-600 mb-6">
          예기치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            다시 시도
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
          >
            홈으로 돌아가기
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 font-medium">
              오류 세부 정보 (개발 모드)
            </summary>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium text-gray-700 mb-2">메시지:</p>
              <p className="text-sm text-red-600 mb-3 font-mono">{error.message}</p>
              
              {error.digest && (
                <>
                  <p className="text-sm font-medium text-gray-700 mb-2">Digest:</p>
                  <p className="text-sm text-gray-600 mb-3 font-mono">{error.digest}</p>
                </>
              )}
              
              <p className="text-sm font-medium text-gray-700 mb-2">스택 트레이스:</p>
              <pre className="text-xs text-gray-600 overflow-auto bg-white p-2 rounded border">
                {error.stack}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-blue-100 rounded-full">
          <svg 
            className="w-8 h-8 text-blue-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 0a4 4 0 11-6 0m6 0a4 4 0 016 0"
            />
          </svg>
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          페이지를 찾을 수 없습니다
        </h2>
        
        <p className="text-gray-600 mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium inline-block"
          >
            홈으로 돌아가기
          </Link>
          
          <Link
            href="/ads"
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium inline-block"
          >
            광고 목록 보기
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            문제가 지속되면{' '}
            <a 
              href="mailto:support@motnt.com" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              고객지원
            </a>
            으로 연락주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
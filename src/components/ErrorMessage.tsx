interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  className?: string;
}

export default function ErrorMessage({
  title = '오류가 발생했습니다',
  message,
  onRetry,
  onGoBack,
  className = ''
}: ErrorMessageProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
          <svg 
            className="w-6 h-6 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              다시 시도
            </button>
          )}
          
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              돌아가기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
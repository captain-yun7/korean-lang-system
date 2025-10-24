interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '',
  text = '로딩 중...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
      ></div>
      {text && (
        <p className={`mt-2 text-gray-600 ${
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        }`}>
          {text}
        </p>
      )}
    </div>
  );
}
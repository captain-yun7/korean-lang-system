interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'detail' | 'table';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ type, count = 1, className = '' }: SkeletonLoaderProps) {
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
      <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  );

  const SkeletonListItem = () => (
    <div className="flex items-center space-x-4 py-4 animate-pulse">
      <div className="w-16 h-12 bg-gray-200 rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
  );

  const SkeletonDetail = () => (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-3/5"></div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-video bg-gray-200 rounded"></div>
          <div className="aspect-video bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  const SkeletonTableRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-4"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-12 w-16 bg-gray-200 rounded mr-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <div className="h-4 bg-gray-200 rounded w-8"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
      </td>
    </tr>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        );
      case 'list':
        return (
          <div className={`divide-y divide-gray-200 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        );
      case 'detail':
        return (
          <div className={className}>
            <SkeletonDetail />
          </div>
        );
      case 'table':
        return (
          <>
            {[...Array(count)].map((_, i) => (
              <SkeletonTableRow key={i} />
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return renderSkeleton();
}
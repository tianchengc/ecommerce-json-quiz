/**
 * Skeleton loader for the results page
 * Displays during SSR data fetching to provide visual feedback
 */
export function ResultsSkeleton() {
  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-5 lg:p-6">
          {/* Header Skeleton */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="h-8 sm:h-10 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-3/4 mx-auto mb-3 animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-2/3 mx-auto animate-pulse"></div>
          </div>

          {/* Summary Box Skeleton */}
          <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm animate-pulse">
            <div className="h-5 bg-gray-200 rounded-lg w-1/3 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>

          {/* Product Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                {/* Image Placeholder */}
                <div className="h-40 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-100"></div>

                {/* Content Placeholder */}
                <div className="p-4 sm:p-5">
                  {/* Badge */}
                  {i === 1 && (
                    <div className="h-3 bg-teal-200 rounded-full w-20 mb-3"></div>
                  )}

                  {/* Title */}
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-2"></div>

                  {/* Price */}
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>

                  {/* Description */}
                  <div className="space-y-2 mb-3">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                  </div>

                  {/* Why it's a match */}
                  <div className="space-y-1 mb-4 py-3 border-t border-gray-100">
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>

                  {/* Button */}
                  <div className="h-10 bg-teal-200 rounded-lg w-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Guidance Section Skeleton */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center p-3 sm:p-4">
                  <div className="h-6 bg-gray-200 rounded-lg w-8 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

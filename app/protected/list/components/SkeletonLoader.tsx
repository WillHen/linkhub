export function SkeletonLoader() {
  return (
    <div className='w-full lg:max-w-[1200px] mx-auto p-8 bg-white shadow-md rounded-lg animate-pulse'>
      {/* Header Skeleton */}
      <div className='flex justify-between items-center mb-8'>
        <div className='h-8 w-48 bg-gray-200 rounded'></div>
        <div className='h-6 w-20 bg-gray-200 rounded'></div>
      </div>

      {/* Title Input Skeleton */}
      <div className='mb-8'>
        <div className='h-6 w-32 bg-gray-200 rounded mb-2'></div>
        <div className='h-12 w-full bg-gray-200 rounded'></div>
      </div>

      {/* Description Input Skeleton */}
      <div className='mb-8'>
        <div className='h-6 w-40 bg-gray-200 rounded mb-2'></div>
        <div className='h-12 w-full bg-gray-200 rounded'></div>
      </div>

      {/* Links Section Skeleton */}
      <div className='mb-8'>
        <div className='h-6 w-20 bg-gray-200 rounded mb-4'></div>
        <div className='space-y-4'>
          {/* Link Item Skeletons */}
          {[1, 2, 3].map((index) => (
            <div key={index} className='p-4 border rounded-lg space-y-4'>
              <div className='h-6 w-32 bg-gray-200 rounded'></div>
              <div className='h-6 w-full bg-gray-200 rounded'></div>
              <div className='h-6 w-full bg-gray-200 rounded'></div>
            </div>
          ))}
        </div>
        <div className='h-12 w-full bg-gray-200 rounded mt-4'></div>
      </div>

      {/* Submit Button Skeleton */}
      <div className='h-14 w-full bg-gray-200 rounded'></div>
    </div>
  );
}

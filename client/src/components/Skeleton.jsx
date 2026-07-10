const Skeleton = ({ className = '' }) => (
  <div className={`bg-gray-700 rounded animate-pulse ${className}`} />
);

const SkeletonCard = () => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-gray-800 rounded-xl border border-gray-700 divide-y divide-gray-700">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-4 flex items-center gap-4">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>
    ))}
  </div>
);

export { Skeleton, SkeletonCard, SkeletonTable };

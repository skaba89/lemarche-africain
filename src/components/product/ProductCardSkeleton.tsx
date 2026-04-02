export default function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Image skeleton */}
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />

      {/* Info skeleton */}
      <div className="p-3 space-y-2">
        {/* Brand */}
        <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        {/* Title - two lines */}
        <div className="space-y-1.5 min-h-[2rem]">
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse" />
            ))}
          </div>
          <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        {/* Price */}
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        {/* Delivery */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

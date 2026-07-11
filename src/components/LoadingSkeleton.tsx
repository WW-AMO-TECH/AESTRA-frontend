const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`skeleton-pulse ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <Skeleton className="aspect-square rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-16" />
    </div>
  </div>
);

export default Skeleton;
export function LoadingSkeleton() {
  return (
    <div className="space-y-6 fade-in">
      <div className="space-y-3">
        <div className="skeleton-pulse h-5 w-32" />
        <div className="skeleton-pulse h-4 w-full" />
        <div className="skeleton-pulse h-4 w-5/6" />
        <div className="skeleton-pulse h-4 w-4/6" />
      </div>
      <div className="space-y-3">
        <div className="skeleton-pulse h-5 w-28" />
        <div className="skeleton-pulse h-4 w-full" />
        <div className="skeleton-pulse h-4 w-3/4" />
      </div>
      <div className="space-y-3">
        <div className="skeleton-pulse h-5 w-24" />
        <div className="skeleton-pulse h-16 w-full" />
        <div className="skeleton-pulse h-16 w-full" />
      </div>
    </div>
  );
}

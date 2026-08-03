export function AdminSkeleton({ className = "" }: { className?: string }) {
  return <div className={`admin-skeleton ${className}`} aria-hidden="true" />;
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="admin-panel">
      {Array.from({ length: rows }).map((_, index) => (
        <AdminSkeleton key={index} className="h-12 mb-3" />
      ))}
    </div>
  );
}

export default function AdminLoading() {
  return (
    <div className="admin-page">
      <div className="admin-panel animate-pulse">
        <div className="mb-4 h-3 w-20 rounded bg-white/10" />
        <div className="mb-8 h-8 w-48 rounded bg-white/10" />
        <div className="admin-stat-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-xl border border-white/10 bg-white/[0.02]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

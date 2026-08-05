export function PageLoadingSkeleton({ title = "Loading" }: { title?: string }) {
  return (
    <div className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="mb-2 h-3 w-24 rounded bg-white/10" />
        <div className="mb-10 h-8 w-64 max-w-full rounded bg-white/10" />
        <p className="sr-only">{title}</p>
        <div className="space-y-4">
          <div className="h-40 rounded border border-white/10 bg-white/[0.02]" />
          <div className="h-40 rounded border border-white/10 bg-white/[0.02]" />
        </div>
      </div>
    </div>
  );
}

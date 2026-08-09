export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-space-800 animate-pulse" />
        <div className="h-4 w-64 rounded-lg bg-space-800 animate-pulse" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-space-700 bg-space-900 p-4 space-y-3 animate-pulse">
          <div className="flex justify-between">
            <div className="h-4 w-24 rounded bg-space-800" />
            <div className="h-5 w-20 rounded-full bg-space-800" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-space-800" />
            <div className="h-4 w-3/4 rounded bg-space-800" />
          </div>
          <div className="h-px bg-space-700" />
          <div className="h-4 w-32 rounded bg-space-800 ml-auto" />
        </div>
      ))}
    </div>
  );
}

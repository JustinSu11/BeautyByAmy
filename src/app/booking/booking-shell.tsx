// Static skeleton shown while services are loading from Square.
// Matches the real BookingPageClient layout to avoid layout shift.
export function BookingShell() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Body skeleton */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Service list skeleton */}
          <div className="lg:col-span-2 space-y-3">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-muted" />
            ))}
          </div>

          {/* Summary panel skeleton */}
          <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </main>
    </div>
  )
}

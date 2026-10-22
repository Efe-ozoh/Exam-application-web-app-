export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading dashboard"
      className="min-h-screen bg-blue-50 px-4 pb-16 pt-8 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading your dashboard...</span>

      <div className="mx-auto max-w-5xl animate-pulse motion-reduce:animate-none">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="h-3 w-36 rounded bg-blue-100" />
            <div className="mt-4 h-9 w-full max-w-md rounded bg-blue-100" />
            <div className="mt-3 h-4 w-56 max-w-full rounded bg-blue-100" />
          </div>
          <div className="h-12 w-full rounded-xl bg-blue-100 sm:w-44" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-50" />
                <div className="h-3 w-24 rounded bg-blue-50" />
              </div>
              <div className="mt-4 h-8 w-20 rounded bg-blue-100" />
              <div className="mt-2 h-4 w-32 rounded bg-blue-50" />
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="h-5 w-48 rounded bg-blue-100" />
            <div className="h-3 w-24 rounded bg-blue-50" />
          </div>

          <div className="mt-4 divide-y divide-blue-50">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-40 max-w-full rounded bg-blue-100" />
                    <div className="mt-2 h-3 w-56 max-w-full rounded bg-blue-50" />
                    <div className="mt-2 h-3 w-28 rounded bg-blue-50" />
                  </div>
                  <div className="h-5 w-16 rounded bg-blue-100" />
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-blue-50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

import type { ReactNode } from "react";

type AuthPageShellProps = {
  children: ReactNode;
  columnClassName: string;
  glowClassName: string;
  heroEyebrow: string;
  heroCaption: string;
  heroTitle: string;
  heroDescription: string;
  sectionLabel: string;
  sectionTitle: string;
};

export function AuthPageShell({
  children,
  columnClassName,
  glowClassName,
  heroEyebrow,
  heroCaption,
  heroTitle,
  heroDescription,
  sectionLabel,
  sectionTitle,
}: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-blue-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div
          className={`grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_30px_80px_rgba(29,78,216,0.16)] ${columnClassName}`}
        >
          <section className="relative hidden overflow-hidden bg-blue-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className={`absolute inset-0 ${glowClassName}`} />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-100">
                {heroEyebrow}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.38em] text-blue-100/80">
                {heroCaption}
              </p>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="h-20 w-20 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md" />
              <div>
                <h1 className="text-4xl font-bold tracking-tight">{heroTitle}</h1>
                <p className="mt-4 max-w-sm text-base text-blue-50/90">{heroDescription}</p>
              </div>
            </div>

            <div className="relative z-10 flex items-end justify-end">
              <div className="h-40 w-52 rounded-t-[2.5rem] rounded-b-[1.5rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md" />
            </div>
          </section>

          <section className="flex items-center justify-center bg-white p-5 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">
              <header className="mb-8 text-center lg:text-left">
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-700">
                  {sectionLabel}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">{sectionTitle}</h2>
              </header>
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
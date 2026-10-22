import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const AUTH_BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1760009230176-be362b5eaecc?auto=format&fit=crop&w=1600&q=80";

const HIGHLIGHTS = ["JAMB-style practice", "Instant results", "Past questions"];

type AuthPageShellProps = {
  children: ReactNode;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  sectionLabel: string;
  sectionTitle: string;
};

export function AuthPageShell({
  children,
  heroEyebrow,
  heroTitle,
  heroDescription,
  sectionLabel,
  sectionTitle,
}: AuthPageShellProps) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-blue-50 text-slate-800">
      <div className="grid w-full lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        <section className="relative flex min-h-[17rem] flex-col justify-between overflow-hidden bg-blue-700 px-5 py-6 text-white sm:min-h-[20rem] sm:px-8 sm:py-8 lg:min-h-full lg:px-12 lg:py-12">
          <Image
            src={AUTH_BACKGROUND_IMAGE}
            alt="Colorful school supplies arranged on a bright background"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-blue-700/90 via-blue-700/70 to-blue-800/90"
          />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <Link
              href="/"
              aria-label="Eduliver home"
              className="inline-flex items-center gap-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/eduliver-logo.png"
                alt="Eduliver logo"
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl bg-[#ffffff] object-contain p-1 shadow-sm"
              />
              <span className="text-lg font-bold tracking-tight">Eduliver</span>
            </Link>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.3em] text-blue-100 sm:inline">
              {heroEyebrow}
            </span>
          </div>

          <div className="relative z-10 mt-8 max-w-md lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {heroTitle}
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-blue-50/90 sm:text-base">
              {heroDescription}
            </p>
          </div>

          <ul className="relative z-10 mt-8 hidden flex-wrap gap-2 sm:flex">
            {HIGHLIGHTS.map((highlight) => (
              <li
                key={highlight}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex items-center justify-center bg-white px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="w-full max-w-md">
            <header className="mb-8 text-center lg:text-left">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-700">
                {sectionLabel}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {sectionTitle}
              </h2>
            </header>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

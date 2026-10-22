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
  sectionTitle: string;
};

export function AuthPageShell({
  children,
  heroEyebrow,
  heroTitle,
  heroDescription,
  sectionTitle,
}: AuthPageShellProps) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-blue-50 text-slate-800">
      <div className="grid w-full lg:min-h-[calc(100vh-4rem)]">
      

        <section className="flex items-center justify-center bg-white px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="w-full max-w-md">
            <header className="mb-8 text-center lg:text-left">
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

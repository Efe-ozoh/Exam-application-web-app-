"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import MenuIcon from "@mui/icons-material/Menu";

import useAuthUser from "@/hooks/useAuthUser";
import Sidedrawer from "./Sidedrawer";
import UserAvatarMenu from "./UserAvatarMenu";

const SIGNED_IN_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/exams", label: "Practice" },
  { href: "/news", label: "News" },
  { href: "/past_questions", label: "Past Questions" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user, isLoading } = useAuthUser();
  const pathname = usePathname();

  const links = user ? SIGNED_IN_LINKS : [];

  const isActive = (href) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-blue-100 bg-white shadow-sm">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Eduliver home"
            className="flex shrink-0 items-center"
          >
            {/* Direct <img> avoids depending on the image optimizer for the
                brand mark, which must always be visible. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/eduliver-logo.png"
              alt="Eduliver logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl bg-[#ffffff] object-contain p-0.5"
            />
          </Link>

          {links.length > 0 && (
            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-1 md:flex"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive(link.href)
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {isLoading ? (
              <span
                aria-hidden="true"
                className="h-10 w-10 animate-pulse rounded-full bg-blue-100"
              />
            ) : user ? (
              <UserAvatarMenu user={user} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                >
                  Sign up
                </Link>
              </>
            )}

            {user && (
              <button
                type="button"
                onClick={() => setOpen((previous) => !previous)}
                aria-label="Open menu"
                aria-expanded={open}
                className="inline-flex items-center justify-center rounded-lg p-2.5 text-blue-700 transition hover:bg-blue-50 md:hidden"
              >
                <MenuIcon />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <Sidedrawer
        open={open}
        user={user}
        isLoading={isLoading}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

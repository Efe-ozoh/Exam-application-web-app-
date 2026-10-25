"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function getDisplayName(user) {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Student"
  );
}

function getInitials(user) {
  const source =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Student";

  const parts = String(source)
    .trim()
    .split(/[\s._@-]+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return String(parts[0] ?? "S").slice(0, 2).toUpperCase();
}

export default function UserAvatarMenu({ user }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-700 text-sm font-bold text-white shadow-sm ring-2 ring-blue-100 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        {avatarUrl ? (
          // Profile pictures come from the auth provider and can live on any
          // domain, so Next's Image remote patterns do not apply here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          getInitials(user)
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-blue-100 bg-white text-left shadow-xl"
        >
          <div className="border-b border-blue-50 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">
              {getDisplayName(user)}
            </p>
            {user.email && (
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            )}
          </div>

          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
          >
            Dashboard
          </Link>

          <Link
            href="/study-assistant"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
          >
            AI Study Assistant
          </Link>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

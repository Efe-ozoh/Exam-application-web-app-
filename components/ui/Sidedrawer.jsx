"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ArticleIcon from "@mui/icons-material/Article";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import CloseIcon from "@mui/icons-material/Close";

import ThemeToggle from "./ThemeToggle";

// Auth screens should not offer a sign-out action.
const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/update-password",
  "/admin007/login",
];

const Sidedrawer = ({ open, user, isLoading, onClose }) => {
  const pathname = usePathname();
  const isSignedIn = Boolean(user);
  const showSignOut = isSignedIn && !AUTH_ROUTES.includes(pathname);

  const handleNavigate = () => onClose?.();

  return (
    <div
      className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between bg-blue-700 p-5 text-white">
        <span className="text-2xl font-bold">Eduliver</span>
        <button
          type="button"
          onClick={handleNavigate}
          aria-label="Close menu"
          className="rounded-lg p-1.5 transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <CloseIcon />
        </button>
      </div>

      <nav className="p-4 flex flex-1 flex-col space-y-4 text-blue-700 font-medium">
        <Link
          href="/"
          onClick={handleNavigate}
          className="flex items-center font-bold gap-3 p-3 rounded-xl hover:bg-[#E8E6FF] transition"
        >
          <HomeIcon /> Home
        </Link>

        {/* These pages are protected by proxy.ts, so only signed-in users
            should see links to them. */}
        {isSignedIn && (
          <>
            <Link
              href="/dashboard"
              onClick={handleNavigate}
              className="flex items-center font-bold gap-3 p-3 rounded-xl hover:bg-[#E8E6FF] transition"
            >
              <DashboardIcon /> Dashboard
            </Link>
            <Link
              href="/exams"
              onClick={handleNavigate}
              className="flex items-center font-bold gap-3 p-3 rounded-xl hover:bg-[#E8E6FF] transition"
            >
              <MenuBookOutlinedIcon /> Practice
            </Link>
            <Link
              href="/news"
              onClick={handleNavigate}
              className="flex items-center font-bold gap-3 p-3 rounded-xl hover:bg-[#E8E6FF] transition"
            >
              <ArticleIcon /> Education News
            </Link>
            <Link
              href="/past_questions"
              onClick={handleNavigate}
              className="flex items-center font-bold gap-3 p-3 rounded-xl hover:bg-[#E8E6FF] transition"
            >
              <InfoOutlineIcon /> Past Questions
            </Link>
          </>
        )}
      </nav>

      <div className="px-4 pb-4">
        <ThemeToggle showLabel />
      </div>

      {!isLoading && (
        <div className="px-4 pb-6">
          {isSignedIn ? (
            showSignOut && (
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Sign out
                </button>
              </form>
            )
          ) : (
            <div className="space-y-3 border-t border-blue-50 pt-4">
              <Link
                href="/login"
                onClick={handleNavigate}
                className="block w-full rounded-xl border border-blue-200 px-4 py-3 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={handleNavigate}
                className="block w-full rounded-xl bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidedrawer;

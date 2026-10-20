import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  isValidAdminSessionToken,
} from "@/lib/auth/admin-session";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/policy",
  "/terms",
  "/admin007",
  "/admin007/login",
  "/auth/callback",
  "/auth/signout",
]);

const AUTH_PATHS = new Set(["/login", "/signup"]);

const STATIC_FILE_PATTERN =
  /\.(?:avif|css|gif|ico|jpe?g|js|json|map|png|svg|txt|webp|woff2?|ttf|otf|xml)$/i;

function copyResponseState(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));

  // Preserve the no-store headers @supabase/ssr sets when it refreshes tokens.
  ["Cache-Control", "Expires", "Pragma"].forEach((header) => {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  });
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const normalizedPath =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const { search } = request.nextUrl;

  if (
    normalizedPath.startsWith("/api") ||
    normalizedPath.startsWith("/_next") ||
    STATIC_FILE_PATTERN.test(normalizedPath)
  ) {
    return NextResponse.next();
  }

  // Admin routes use their own signed session cookie, not Supabase auth.
  const isAdminPath =
    normalizedPath.startsWith("/admin007") &&
    !PUBLIC_PATHS.has(normalizedPath);

  if (isAdminPath) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (!isValidAdminSessionToken(token)) {
      return NextResponse.redirect(new URL("/admin007/login", request.url));
    }

    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          // Required by @supabase/ssr whenever auth cookies are written.
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    },
  );

  // Refresh the session on every non-static request so the access token stays
  // fresh even while the user is on a public page. An auth-provider outage
  // should not take down public pages.
  let user: User | null = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  const isPublic = PUBLIC_PATHS.has(normalizedPath);

  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    const target = `${normalizedPath}${search}`;

    if (target !== "/") {
      loginUrl.searchParams.set("next", target);
    }

    const redirectResponse = NextResponse.redirect(loginUrl);
    copyResponseState(response, redirectResponse);
    return redirectResponse;
  }

  // Signed-in users should not sit on the login/signup screens.
  if (user && AUTH_PATHS.has(normalizedPath)) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));
    copyResponseState(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

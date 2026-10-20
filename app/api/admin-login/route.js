import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  safeCompareSecret,
} from "@/lib/auth/admin-session";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const password = body?.password;
    const expected = process.env.ADMIN_PASSWORD;

    if (!expected) {
      return NextResponse.json(
        { success: false, message: "Admin login is not configured." },
        { status: 500 },
      );
    }

    if (
      typeof password !== "string" ||
      !safeCompareSecret(password, expected)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid admin password" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });

    // Signed, expiring token instead of the literal string "true" so the
    // cookie cannot be forged by anyone who can send a request.
    response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }
}

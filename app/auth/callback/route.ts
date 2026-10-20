import { NextResponse, type NextRequest } from "next/server";

import { sanitizeNextPath } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

type OtpType = (typeof OTP_TYPES)[number];

function isOtpType(value: string): value is OtpType {
  return (OTP_TYPES as readonly string[]).includes(value);
}

function truncate(message: string, max = 300): string {
  return message.length > max ? `${message.slice(0, max)}...` : message;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type");
  const next = sanitizeNextPath(searchParams.get("next"));

  const providerError =
    searchParams.get("error_description") ?? searchParams.get("error");

  const responseHeaders: Record<string, string> = {};

  const redirectTo = (pathname: string, params?: Record<string, string>) => {
    const url = new URL(pathname, requestUrl.origin);
    Object.entries(params ?? {}).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );

    const response = NextResponse.redirect(url);
    Object.entries(responseHeaders).forEach(([key, value]) =>
      response.headers.set(key, value),
    );

    return response;
  };

  const redirectWithError = (message: string) =>
    redirectTo("/login", { error: truncate(message) });

  if (providerError) {
    return redirectWithError(providerError);
  }

  const hasCode = Boolean(code);
  const hasTokenHash = Boolean(tokenHash && otpType && isOtpType(otpType));

  if (!hasCode && !hasTokenHash) {
    return redirectWithError("The sign-in link is invalid or has expired.");
  }

  const supabase = await createClient({
    onResponseHeaders: (headers) => Object.assign(responseHeaders, headers),
  });

  let errorMessage: string | null = null;

  if (hasTokenHash && tokenHash && otpType && isOtpType(otpType)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });

    if (error) errorMessage = error.message;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) errorMessage = error.message;
  }

  if (errorMessage) {
    return redirectWithError(errorMessage);
  }

  return redirectTo(next);
}

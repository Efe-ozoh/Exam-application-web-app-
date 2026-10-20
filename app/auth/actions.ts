"use server";

import { getSiteUrl } from "@/lib/auth/site-url";
import {
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  sanitizeNextPath,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult =
  | {
      success: true;
      message?: string;
      /** Provider URL to navigate to (OAuth). */
      url?: string;
      /** Same-origin path to navigate to after a successful auth flow. */
      redirectTo?: string;
    }
  | { success: false; error: string };

function friendlyAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }

  if (normalized.includes("user already registered")) {
    return "An account with this email address already exists.";
  }

  if (normalized.includes("password should be at least")) {
    return message;
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  if (normalized.includes("link is invalid") || normalized.includes("expired")) {
    return "That link is invalid or has expired. Please request a new one.";
  }

  return message;
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const { email, password } = readCredentials(formData);
  const next = sanitizeNextPath(String(formData.get("next") ?? "/"));

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { success: false, error: friendlyAuthError(error.message) };
  }

  if (data.user && !data.session) {
    return {
      success: true,
      message: "Your account was created. Check your email to confirm it.",
    };
  }

  return {
    success: true,
    message: "Account created successfully.",
    redirectTo: next,
  };
}

export async function signInWithEmailAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const { email, password } = readCredentials(formData);

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // Do not enforce a minimum length on login: accounts created before this
  // check (or with Supabase's lower default) may have shorter passwords.
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: friendlyAuthError(error.message) };
  }

  return { success: true, message: "Signed in successfully." };
}

export async function signInWithGoogleAction(
  next?: string,
): Promise<AuthActionResult> {
  const safeNext = sanitizeNextPath(next);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { success: false, error: friendlyAuthError(error.message) };
  }

  if (!data.url) {
    return { success: false, error: "Google sign-in is unavailable right now." };
  }

  return { success: true, url: data.url };
}

export async function requestPasswordResetAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();

  if (!isValidEmail(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/update-password")}`,
  });

  if (error) {
    return { success: false, error: friendlyAuthError(error.message) };
  }

  // Always return the same message so this endpoint cannot be used to
  // discover which email addresses have accounts.
  return {
    success: true,
    message: "If an account exists for that email, a reset link is on its way.",
  };
}

export async function updatePasswordAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Your reset link has expired. Please request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { success: false, error: friendlyAuthError(error.message) };
  }

  return { success: true, message: "Password updated successfully." };
}

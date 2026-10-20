"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  signInWithEmailAction,
  signInWithGoogleAction,
} from "@/app/auth/actions";
import {
  AuthDivider,
  AuthStatusMessage,
  AuthSubmitButton,
  GoogleSignInButton,
} from "@/components/auth/AuthFormControls";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { EmailField, PasswordField } from "@/components/auth/AuthFields";
import { sanitizeNextPath } from "@/lib/auth/validation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  // Only require a value here. Enforcing a minimum length at login would
  // lock out existing accounts with shorter (but valid) passwords.
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next"));
  const callbackError = searchParams.get("error");
  const callbackMessage = searchParams.get("message");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setFormError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("next", nextPath);

    try {
      const result = await signInWithEmailAction(formData);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setFormError("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError("");
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogleAction(nextPath);

      if (!result.success) {
        setFormError(result.error);
        setIsGoogleLoading(false);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
        return;
      }

      setIsGoogleLoading(false);
    } catch {
      setFormError("Unable to start Google sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const signupHref =
    nextPath !== "/" ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup";

  const visibleError = formError || callbackError;

  return (
    <AuthPageShell
      columnClassName="lg:grid-cols-[1.1fr_0.9fr]"
      glowClassName="bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.3),_transparent_45%)]"
      heroEyebrow="Excellence"
      heroCaption="Education"
      heroTitle="Welcome back."
      heroDescription="Continue your academic journey with smart tools, personalized guidance, and access to your learning dashboard."
      sectionLabel="Access Portal"
      sectionTitle="Sign in"
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <EmailField
          registration={form.register("email")}
          error={form.formState.errors.email?.message}
        />
        <PasswordField
          id="password"
          label="Password"
          placeholder="Enter your password"
          registration={form.register("password")}
          error={form.formState.errors.password?.message}
        />

        <div className="flex items-center justify-end text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-blue-700 transition hover:text-blue-800"
          >
            Forgot password?
          </Link>
        </div>

        {visibleError && <AuthStatusMessage kind="error" message={visibleError} />}
        {!visibleError && callbackMessage && (
          <AuthStatusMessage kind="success" message={callbackMessage} />
        )}

        <AuthSubmitButton
          disabled={isSubmitting || isGoogleLoading}
          isLoading={isSubmitting}
          label="Sign in"
          loadingLabel="Signing in..."
        />
        <AuthDivider />
        <GoogleSignInButton
          disabled={isGoogleLoading || isSubmitting}
          isLoading={isGoogleLoading}
          onClick={handleGoogleSignIn}
        />
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href={signupHref}
          className="font-semibold text-blue-700 transition hover:text-blue-800"
        >
          Create one
        </Link>
      </p>
    </AuthPageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-blue-50" />}>
      <LoginForm />
    </Suspense>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  signInWithGoogleAction,
  signUpAction,
} from "@/app/auth/actions";
import {
  AuthDivider,
  AuthStatusMessage,
  AuthSubmitButton,
  GoogleSignInButton,
} from "@/components/auth/AuthFormControls";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import {
  EmailField,
  NameField,
  PasswordField,
} from "@/components/auth/AuthFields";
import {
  MIN_PASSWORD_LENGTH,
  sanitizeNextPath,
} from "@/lib/auth/validation";

const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Please enter your full name.")
      .max(80, "Name must be 80 characters or fewer."),
    email: z.string().email("Please enter a valid email address."),
    password: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      ),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next"));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: SignupFormValues) => {
    setFormError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("fullName", values.fullName);
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("next", nextPath);

    try {
      const result = await signUpAction(formData);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      // When email confirmation is disabled Supabase returns a session, so
      // the user is already signed in and should continue into the app.
      if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
        return;
      }

      setSuccessMessage(result.message ?? "Account created successfully.");
      form.reset();
    } catch {
      setFormError("Unable to create your account right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError("");
    setSuccessMessage("");
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

  const loginHref =
    nextPath !== "/" ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  return (
    <AuthPageShell
      heroEyebrow="Join Us"
      heroTitle="Create your account."
      heroDescription="Unlock access to elite practice tools, exam resources, and learning experiences designed to keep you focused on excellence."
      sectionLabel="Member Signup"
      sectionTitle="Create account"
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <NameField
          registration={form.register("fullName")}
          error={form.formState.errors.fullName?.message}
        />
        <EmailField
          registration={form.register("email")}
          error={form.formState.errors.email?.message}
        />
        <PasswordField
          id="password"
          label="Password"
          placeholder="Create a strong password"
          registration={form.register("password")}
          error={form.formState.errors.password?.message}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          registration={form.register("confirmPassword")}
          error={form.formState.errors.confirmPassword?.message}
        />

        {formError && <AuthStatusMessage kind="error" message={formError} />}
        {!formError && successMessage && (
          <AuthStatusMessage kind="success" message={successMessage} />
        )}

        <AuthSubmitButton
          disabled={isSubmitting || isGoogleLoading}
          isLoading={isSubmitting}
          label="Create account"
          loadingLabel="Creating account..."
        />
        <AuthDivider />
        <GoogleSignInButton
          disabled={isGoogleLoading || isSubmitting}
          isLoading={isGoogleLoading}
          onClick={handleGoogleSignIn}
        />
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="font-semibold text-blue-700 transition hover:text-blue-800"
        >
          Sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-blue-50" />}>
      <SignupForm />
    </Suspense>
  );
}

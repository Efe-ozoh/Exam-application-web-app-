"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { requestPasswordResetAction } from "@/app/auth/actions";
import {
  AuthStatusMessage,
  AuthSubmitButton,
} from "@/components/auth/AuthFormControls";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { EmailField } from "@/components/auth/AuthFields";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (values: ForgotPasswordValues) => {
    setFormError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("email", values.email);

    try {
      const result = await requestPasswordResetAction(formData);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      setSuccessMessage(
        result.message ??
          "If an account exists for that email, a reset link is on its way.",
      );
      form.reset();
    } catch {
      setFormError("Unable to send a reset link right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      columnClassName="lg:grid-cols-[1fr_1fr]"
      glowClassName="bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.3),_transparent_40%)]"
      heroEyebrow="Recovery"
      heroCaption="Account Access"
      heroTitle="Reset your password."
      heroDescription="Enter the email address linked to your account and we will send you a secure link to choose a new password."
      sectionLabel="Password Reset"
      sectionTitle="Forgot password"
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <EmailField
          registration={form.register("email")}
          error={form.formState.errors.email?.message}
        />

        {formError && <AuthStatusMessage kind="error" message={formError} />}
        {!formError && successMessage && (
          <AuthStatusMessage kind="success" message={successMessage} />
        )}

        <AuthSubmitButton
          disabled={isSubmitting}
          isLoading={isSubmitting}
          label="Send reset link"
          loadingLabel="Sending..."
        />
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-700 transition hover:text-blue-800"
        >
          Back to sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}

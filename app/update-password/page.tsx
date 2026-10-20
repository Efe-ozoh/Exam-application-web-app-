"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updatePasswordAction } from "@/app/auth/actions";
import {
  AuthStatusMessage,
  AuthSubmitButton,
} from "@/components/auth/AuthFormControls";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { PasswordField } from "@/components/auth/AuthFields";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";

const updatePasswordSchema = z
  .object({
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

type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const form = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: UpdatePasswordValues) => {
    setFormError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("password", values.password);
    formData.set("confirmPassword", values.confirmPassword);

    try {
      const result = await updatePasswordAction(formData);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      router.push(
        `/login?message=${encodeURIComponent(
          "Password updated. Sign in with your new password.",
        )}`,
      );
      router.refresh();
    } catch {
      setFormError("Unable to update your password right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      columnClassName="lg:grid-cols-[1fr_1fr]"
      glowClassName="bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.3),_transparent_40%)]"
      heroEyebrow="Security"
      heroCaption="Password Update"
      heroTitle="Choose a new password."
      heroDescription="Pick a strong password you have not used before. You will use it the next time you sign in."
      sectionLabel="Account Security"
      sectionTitle="Update password"
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <PasswordField
          id="password"
          label="New Password"
          placeholder="Enter a new password"
          registration={form.register("password")}
          error={form.formState.errors.password?.message}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm New Password"
          placeholder="Confirm your new password"
          registration={form.register("confirmPassword")}
          error={form.formState.errors.confirmPassword?.message}
        />

        {formError && <AuthStatusMessage kind="error" message={formError} />}

        <AuthSubmitButton
          disabled={isSubmitting}
          isLoading={isSubmitting}
          label="Update password"
          loadingLabel="Updating..."
        />
      </form>
    </AuthPageShell>
  );
}

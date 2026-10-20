"use client";

import { ArrowRight, Globe } from "lucide-react";

type AuthSubmitButtonProps = {
  disabled: boolean;
  isLoading: boolean;
  label: string;
  loadingLabel: string;
};

export function AuthSubmitButton({
  disabled,
  isLoading,
  label,
  loadingLabel,
}: AuthSubmitButtonProps) {
  return (
    <button
      disabled={disabled}
      type="submit"
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition-all duration-200 hover:scale-[1.01] hover:bg-blue-800 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {loadingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="relative my-4 flex items-center justify-center">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="px-3 text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
        Or
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

type GoogleSignInButtonProps = {
  disabled: boolean;
  isLoading: boolean;
  onClick: () => void | Promise<void>;
};

export function GoogleSignInButton({
  disabled,
  isLoading,
  onClick,
}: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      ) : (
        <Globe className="h-4 w-4 text-red-500" />
      )}
      Continue with Google
    </button>
  );
}

type AuthStatusMessageProps = {
  kind: "error" | "success";
  message: string;
};

export function AuthStatusMessage({ kind, message }: AuthStatusMessageProps) {
  const className =
    kind === "error"
      ? "rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
      : "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700";

  return <div className={className}>{message}</div>;
}
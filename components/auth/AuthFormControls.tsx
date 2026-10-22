"use client";

import { ArrowRight } from "lucide-react";

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

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.1A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.26A11.99 11.99 0 0 0 0 12c0 1.93.46 3.76 1.26 5.38l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.62l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
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
        <GoogleIcon />
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
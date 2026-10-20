"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type AuthFieldProps = {
  registration: UseFormRegisterReturn;
  error?: string;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-500">{message}</p>;
}

export function EmailField({ registration, error }: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="email" className="text-sm font-medium text-slate-700">
        Email Address
      </label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          {...registration}
          id="email"
          type="email"
          placeholder="name@example.com"
          className={inputClassName}
          aria-invalid={Boolean(error)}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

type PasswordFieldProps = AuthFieldProps & {
  id: string;
  label: string;
  placeholder: string;
};

export function PasswordField({
  id,
  label,
  placeholder,
  registration,
  error,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          {...registration}
          id={id}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          className={`${inputClassName} pr-12`}
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-600"
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}
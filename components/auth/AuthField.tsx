"use client";

import type { InputHTMLAttributes } from "react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function AuthField({ label, id, className = "", ...props }: AuthFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="auth-field group">
      <label
        htmlFor={fieldId}
        className="mb-2 block text-xs uppercase tracking-[0.25em] text-muted"
      >
        {label}
      </label>
      <input
        id={fieldId}
        className={`auth-field-input min-h-11 w-full border border-white/20 bg-transparent px-4 py-3 text-base text-foreground placeholder:text-foreground/30 outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(139,30,30,0.32)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    </div>
  );
}

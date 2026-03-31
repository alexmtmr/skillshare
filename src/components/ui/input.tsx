"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full h-12 px-4 border rounded-DEFAULT text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors ${
            error ? "border-accent" : "border-divider"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-accent">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

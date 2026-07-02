import { InputHTMLAttributes, forwardRef } from "react";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  size?: InputSize;
  error?: boolean;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "h-9 px-2 text-small",
  md: "h-11 px-4 text-body",
  lg: "h-12 px-6 text-large",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = "md", error = false, disabled, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={error || undefined}
        className={
          `bg-surface-light text-text-primary w-full rounded-sm border shadow-inner ` +
          `placeholder:text-text-secondary transition-colors ` +
          `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ` +
          `disabled:bg-bg-light disabled:cursor-not-allowed disabled:opacity-50 ` +
          (error
            ? "border-danger focus-visible:ring-danger "
            : "border-border-light hover:border-border-hover focus-visible:border-primary focus-visible:ring-primary ") +
          `${sizeClasses[size]} ${className}`
        }
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

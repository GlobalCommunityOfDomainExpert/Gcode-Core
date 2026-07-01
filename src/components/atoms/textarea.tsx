import { TextareaHTMLAttributes, forwardRef } from "react";

export type TextareaVariant = "default" | "filled" | "outline";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextareaVariant;
  error?: boolean;
}

const variantClasses: Record<TextareaVariant, string> = {
  default: "bg-surface-light border-border-light hover:border-border-hover",
  filled: "bg-bg-light border-transparent hover:border-border-hover",
  outline: "bg-transparent border-border-light hover:border-border-hover",
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { variant = "default", error = false, disabled, rows = 4, className = "", ...props },
    ref
  ) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        aria-invalid={error || undefined}
        className={
          `w-full rounded-sm border px-4 py-2 text-body text-text-primary shadow-inner ` +
          `placeholder:text-text-secondary transition-colors ` +
          `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ` +
          `disabled:cursor-not-allowed disabled:bg-bg-light disabled:opacity-50 ` +
          (error
            ? "border-danger focus-visible:ring-danger "
            : `${variantClasses[variant]} focus-visible:border-primary focus-visible:ring-primary `) +
          className
        }
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

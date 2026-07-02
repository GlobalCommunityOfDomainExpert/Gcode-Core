import { ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "./spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-ghost"
  | "success"
  | "warning"
  | "accent";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-bold transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary:
    "bg-surface-light text-text-primary border border-border-light hover:bg-bg-light",
  outline:
    "bg-transparent text-primary border border-primary hover:bg-primary-light",
  ghost: "bg-transparent text-primary hover:bg-primary-light",
  danger: "bg-danger text-white hover:bg-danger/90",
  "danger-ghost": "bg-transparent text-danger hover:bg-danger-light",
  success: "bg-success text-white hover:bg-success/90",
  warning: "bg-warning text-text-primary hover:bg-warning/90",
  accent: "bg-secondary text-white hover:bg-secondary-hover",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "min-h-11 px-2 text-small",
  sm: "min-h-11 px-4 text-small",
  md: "min-h-11 px-6 text-body",
  lg: "min-h-11 px-8 text-body",
  xl: "min-h-11 px-8 text-large",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
) {
  return `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonClasses(variant, size, className)}
        {...props}
      >
        {loading && <Spinner size="sm" className="text-current" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

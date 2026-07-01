import { AnchorHTMLAttributes, forwardRef } from "react";

export type LinkVariant = "primary" | "secondary";
export type LinkSize = "sm" | "md";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  size?: LinkSize;
}

const variantClasses: Record<LinkVariant, string> = {
  primary: "text-primary",
  secondary: "text-text-secondary",
};

const sizeClasses: Record<LinkSize, string> = {
  sm: "text-small",
  md: "text-body",
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={`font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }
);

Link.displayName = "Link";

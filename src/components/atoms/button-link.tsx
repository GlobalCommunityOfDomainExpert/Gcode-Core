import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, forwardRef } from "react";
import { ButtonShape, ButtonSize, ButtonVariant, buttonClasses } from "./button";

export interface ButtonLinkProps
  extends
    LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
}

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      variant = "primary",
      size = "md",
      shape = "default",
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Link
        ref={ref}
        className={buttonClasses(variant, size, className, shape)}
        {...props}
      >
        {children}
      </Link>
    );
  },
);

ButtonLink.displayName = "ButtonLink";

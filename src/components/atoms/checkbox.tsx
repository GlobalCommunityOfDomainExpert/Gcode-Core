"use client";

import { InputHTMLAttributes, forwardRef, useEffect, useRef } from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate = false, className = "", id, ...props }, forwardedRef) => {
    const internalRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer items-center gap-2 text-body text-text-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
      >
        <input
          id={id}
          type="checkbox"
          ref={(node) => {
            internalRef.current = node;
            if (typeof forwardedRef === "function") forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
          }}
          className={`size-5 shrink-0 rounded-sm border border-border-light accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {label}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

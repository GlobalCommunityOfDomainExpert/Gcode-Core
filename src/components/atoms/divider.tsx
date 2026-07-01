import { HTMLAttributes } from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerThickness = "thin" | "thick";

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  orientation?: DividerOrientation;
  thickness?: DividerThickness;
}

export function Divider({
  orientation = "horizontal",
  thickness = "thin",
  className = "",
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`h-full self-stretch bg-border-light ${
          thickness === "thick" ? "w-0.5" : "w-px"
        } ${className}`}
        {...props}
      />
    );
  }

  return (
    <hr
      role="separator"
      className={`w-full border-0 border-t border-border-light ${
        thickness === "thick" ? "border-t-2" : "border-t"
      } ${className}`}
      {...props}
    />
  );
}

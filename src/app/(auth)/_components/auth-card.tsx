import { ReactNode } from "react";
import Image from "next/image";

export interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Left-column image. Falls back to a brand gradient placeholder when omitted. */
  imageSrc?: string;
  /**
   * "page" (default): full standalone card — outer border/shadow/background, capped width.
   * "modal": just the two-column content grid, no outer shell — for embedding inside <Modal>,
   * which already supplies the dialog's background/border/shadow/width.
   */
  variant?: "page" | "modal";
}

export function AuthCard({
  title,
  subtitle,
  children,
  imageSrc,
  variant = "page",
}: AuthCardProps) {
  const grid = (
    <div
      className={`grid overflow-hidden lg:grid-cols-2 ${
        variant === "page" ? "rounded-lg" : "rounded-md"
      }`}
    >
      <div className="from-primary to-primary-hover relative hidden bg-gradient-to-br lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-10">
        {imageSrc ? (
          <Image src={imageSrc} alt="" fill className="object-cover" priority />
        ) : (
          <div className="relative flex flex-col items-center gap-4 text-center">
            <Image
              src="/app-logo.png"
              width={140}
              height={28}
              alt="GCODE"
              className="object-contain brightness-0 invert"
            />
            <p className="text-body max-w-xs text-white/80">
              Connect, learn, and grow with the GCODE community.
            </p>
          </div>
        )}
      </div>

      <div className={`p-8 ${variant === "modal" ? "min-h-[630px]" : ""}`}>
        <div className="mb-8 text-center">
          <h1 className="text-heading text-text-primary font-bold">{title}</h1>
          {subtitle && (
            <p className="text-body text-text-secondary mt-1">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );

  if (variant === "modal") return grid;

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-surface-light border-border-light rounded-lg border shadow-lg">
        {grid}
      </div>
    </div>
  );
}

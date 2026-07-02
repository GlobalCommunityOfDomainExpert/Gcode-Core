import { Spinner } from "./spinner";

export interface QrPlaceholderProps {
  src?: string;
  alt?: string;
  loading?: boolean;
  className?: string;
}

export function QrPlaceholder({
  src,
  alt = "QR code",
  loading = false,
  className = "",
}: QrPlaceholderProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`border-border-light size-24 rounded-sm border object-contain ${className}`}
      />
    );
  }

  return (
    <div
      role={loading ? "status" : "img"}
      aria-label={loading ? "Loading QR code" : "QR code placeholder"}
      className={`border-border-light bg-bg-light text-small text-text-secondary flex size-24 flex-col items-center justify-center gap-0.5 rounded-sm border ${className}`}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <>
          <span>QR</span>
          <span>Code</span>
        </>
      )}
    </div>
  );
}

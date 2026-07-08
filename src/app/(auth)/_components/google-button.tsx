import { Button, ButtonLink } from "@/components/atoms";

export interface GoogleButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 20 20" className="size-5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.97-4.33 2.97-7.31Z"
      />
      <path
        fill="#34A853"
        d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.06.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H1.06v2.59A10 10 0 0 0 10 20Z"
      />
      <path
        fill="#FBBC05"
        d="M4.4 11.92a5.99 5.99 0 0 1 0-3.84V5.49H1.06a10 10 0 0 0 0 9.02l3.34-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.53 9.53 0 0 0 10 0 10 10 0 0 0 1.06 5.49l3.34 2.59C5.2 5.72 7.4 3.96 10 3.96Z"
      />
    </svg>
  );
}

export function GoogleButton({ href, onClick, className = "" }: GoogleButtonProps) {
  const content = (
    <>
      <GoogleLogo />
      <span>Continue with Google</span>
    </>
  );

  if (href) {
    return (
      <ButtonLink href={href} variant="secondary" className={`w-full ${className}`}>
        {content}
      </ButtonLink>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      className={`w-full ${className}`}
    >
      {content}
    </Button>
  );
}

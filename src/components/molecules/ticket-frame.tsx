import { ReactNode } from "react";

export interface TicketNotchesProps {
  size?: number;
  // "horizontal" (default): notches bite the vertical center of the left/right
  // edges, pairing with a vertical perforation divider (single CTA button).
  // "vertical": notches bite the horizontal center of the top/bottom edges,
  // pairing with a horizontal perforation divider (stacked card content).
  orientation?: "horizontal" | "vertical";
}

// Two circles colored bg-surface-light, positioned to visually "punch
// through" a ticket border. Both real usages (TicketFrame and
// SelectableCard's shape="ticket") always sit directly inside the booking
// card's bg-surface-light wrapper, so a fixed surface-light fill blends
// seamlessly — no clip-path/mask needed.
export function TicketNotches({
  size = 20,
  orientation = "horizontal",
}: TicketNotchesProps) {
  const style = { width: size, height: size };
  if (orientation === "vertical") {
    return (
      <>
        <span
          aria-hidden="true"
          style={style}
          className="bg-surface-light absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
        />
        <span
          aria-hidden="true"
          style={style}
          className="bg-surface-light absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2 rounded-full"
        />
      </>
    );
  }
  return (
    <>
      <span
        aria-hidden="true"
        style={style}
        className="bg-surface-light absolute top-1/2 left-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
      />
      <span
        aria-hidden="true"
        style={style}
        className="bg-surface-light absolute top-1/2 right-0 z-10 translate-x-1/2 -translate-y-1/2 rounded-full"
      />
    </>
  );
}

export interface TicketFrameProps {
  children: ReactNode;
  className?: string;
}

// Ticket-shaped outer shell for a single buy-pass CTA: light gold border
// with semicircular notches bitten out of the left/right edges. No
// perforation divider here — a single-line button label has no natural
// two-part split (see SelectableCard's shape="ticket" for that layout).
export function TicketFrame({ children, className = "" }: TicketFrameProps) {
  return (
    <div className={`border-ticket/30 relative rounded-md border ${className}`}>
      {children}
      <TicketNotches />
    </div>
  );
}

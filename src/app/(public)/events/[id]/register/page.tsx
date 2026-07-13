"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { Button, Card, Input, Label, SectionLabel } from "@/components/atoms";
import { Banner, NotFoundState } from "@/components/molecules";
import { useEvent } from "@/hooks/use-event";
import { registerForEvent } from "@/lib/api/participants";
import { ApiError } from "@/lib/api/client";
import { getSession } from "@/lib/auth/session";

// create_participant always finds-or-creates the GCODE_USERS row by
// full_name + email — both binds are required regardless of the
// Authorization header, so they're always sent. full_name comes from the
// JWT when signed in (every route under (app) requires sign-in) and isn't
// asked again; email has no JWT claim, so it's still asked for.
export default function EventRegisterPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { event, status } = useEvent(params.id);
  const session = getSession();
  const [fullName, setFullName] = useState(session?.fullName ?? "");
  const [email, setEmail] = useState("");
  // Kept as free text while typing (see clampQuantity) — clamping on every
  // keystroke snaps a cleared/partial field back to "1", making it
  // impossible to type a second digit.
  const [quantityInput, setQuantityInput] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!event) {
    return (
      <NotFoundState
        icon={Compass}
        title={status === "loading" ? "Loading event…" : "Event not found"}
        description={
          status === "loading"
            ? "Fetching this event."
            : "This event may not exist, or it couldn't be loaded."
        }
        actionHref="/events"
        actionLabel="Browse Events"
      />
    );
  }

  // Whichever is stricter: remaining event capacity, or the organizer's
  // per-booking cap. Either may be unset (no limit).
  const maxQuantity = [event.spotsLeft, event.maxTicketsPerRegistration]
    .filter((n): n is number => n !== undefined)
    .reduce((min, n) => Math.min(min, n), Infinity);
  const soldOut = maxQuantity <= 0;

  function clampQuantity(raw: number): number {
    const n = Number.isFinite(raw) ? Math.trunc(raw) : 1;
    const withMin = Math.max(n, 1);
    return Number.isFinite(maxQuantity)
      ? Math.min(withMin, maxQuantity)
      : withMin;
  }

  async function submit() {
    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required.");
      return;
    }
    const quantity = clampQuantity(Number(quantityInput));
    setSubmitting(true);
    setError("");
    try {
      const { participant_id } = await registerForEvent(params.id, {
        full_name: fullName.trim(),
        email: email.trim(),
        quantity,
      });
      router.push(`/events/${params.id}/registered?pid=${participant_id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Registration failed. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-large text-text-primary font-bold">
          Register for {event.title}
        </h1>
        <p className="text-small text-text-secondary">
          {event.date} · {event.time} · {event.location}
        </p>
      </div>

      <Card padding="md" className="space-y-4">
        <SectionLabel>Your Details</SectionLabel>
        {error && <Banner tone="danger">{error}</Banner>}
        {soldOut ? (
          <Banner tone="danger">
            This event is sold out — no tickets remaining.
          </Banner>
        ) : (
          <>
            {session ? (
              <div className="space-y-1">
                <p className="text-body text-text-primary font-semibold">
                  {session.fullName}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="quantity">Number of Tickets</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={Number.isFinite(maxQuantity) ? maxQuantity : undefined}
                value={quantityInput}
                onChange={(event) => setQuantityInput(event.target.value)}
                onBlur={() =>
                  setQuantityInput(String(clampQuantity(Number(quantityInput))))
                }
              />
              {Number.isFinite(maxQuantity) && (
                <p className="text-small text-text-secondary">
                  Up to {maxQuantity} ticket{maxQuantity === 1 ? "" : "s"}{" "}
                  available.
                </p>
              )}
            </div>
            <Button
              variant="primary"
              className="w-full"
              loading={submitting}
              onClick={submit}
            >
              Confirm Registration
            </Button>
            {!session && (
              <p className="text-small text-text-secondary text-center">
                No account needed — you can create a password later to manage
                your registrations.
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

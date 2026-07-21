"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AlertTriangle, Check, Compass, Mic } from "lucide-react";
import { Button, Card, Icon } from "@/components/atoms";
import { Banner, NotFoundState } from "@/components/molecules";
import { useEvent } from "@/hooks/use-event";
import { getParticipant } from "@/lib/api/participants";
import {
  getLivePerformer,
  LivePerformer,
  REACTION_EMOJIS,
  submitRating,
  submitReaction,
} from "@/lib/api/ratings";
import { ApiError } from "@/lib/api/client";
import { ParticipantApi } from "@/lib/api/types";

export default function RateEventPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const attendeeId = searchParams.get("aid");
  const { event } = useEvent(params.id);

  const [attendee, setAttendee] = useState<ParticipantApi | undefined>();
  const [attendeeStatus, setAttendeeStatus] = useState<
    "loading" | "error" | "ready"
  >(attendeeId ? "loading" : "error");

  const [live, setLive] = useState<LivePerformer | null>(null);
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Re-renders every second so the countdown stays live without waiting on
  // the next SSE message.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!attendeeId) return;
    let cancelled = false;
    void (async () => {
      try {
        const row = await getParticipant(attendeeId);
        if (cancelled) return;
        if (!row) {
          setAttendeeStatus("error");
          return;
        }
        setAttendee(row);
        setAttendeeStatus("ready");
      } catch {
        if (!cancelled) setAttendeeStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attendeeId]);

  useEffect(() => {
    if (!attendeeId || !params.id || attendeeStatus !== "ready") return;

    const source = new EventSource(
      `/api/events/${params.id}/live-performer/stream?attendee_id=${attendeeId}`,
    );
    source.onmessage = (e) => {
      const data: LivePerformer = JSON.parse(e.data);
      setLive(data);
      setRating(5);
    };
    return () => source.close();
  }, [attendeeId, params.id, attendeeStatus]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!event || attendeeStatus === "loading") {
    return (
      <NotFoundState
        icon={Compass}
        title="Loading…"
        description="Fetching your rating link."
        actionHref="/events"
        actionLabel="Browse Events"
      />
    );
  }

  if (attendeeStatus === "error" || !attendee) {
    return (
      <NotFoundState
        icon={Compass}
        title="Link not found"
        description="We couldn't find this rating link. Check the link from your email."
        actionHref={`/events/${event.id}`}
        actionLabel="Back to Event"
      />
    );
  }

  if (attendee.category === "PARTICIPANT") {
    return (
      <NotFoundState
        icon={Compass}
        title="Nothing to rate"
        description="Rating is only available for Attendee-category registrations."
        actionHref={`/events/${event.id}`}
        actionLabel="Back to Event"
      />
    );
  }

  const windowClosesAtMs = live?.window_closes_at
    ? new Date(live.window_closes_at).getTime()
    : null;
  const secondsLeft = windowClosesAtMs
    ? Math.max(0, Math.ceil((windowClosesAtMs - now) / 1000))
    : 0;
  // On stage but the organizer hasn't hit Start Rating yet — distinct from
  // windowClosed below, which only applies once a window has actually opened
  // and expired. Without this split, a performer who's merely on stage reads
  // as "rating window closed", which is wrong — it never opened.
  const ratingNotStarted = !!live?.participant_id && !live?.window_closes_at;
  // Casual never expires — once started, reactions stay open until a new
  // performer is selected. Only Competitive's 2-minute window actually closes.
  const windowClosed =
    event.ratingMode === "Competitive" &&
    !!live?.participant_id &&
    !!live?.window_closes_at &&
    secondsLeft <= 0;

  async function handleSubmit() {
    if (!live?.participant_id) return;
    setSubmitting(true);
    setError("");
    try {
      await submitRating(attendeeId!, live.participant_id, rating);
      setLive({ ...live, already_rated: true });
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Couldn't save your rating. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-large text-text-primary font-bold">
          Live Rating — {event.title}
        </h1>
        <p className="text-small text-text-secondary">
          {event.ratingMode === "Casual"
            ? "Tap an emoji to react as it happens — tap as many times as you like."
            : "Rate each performance from 0–10 as it happens. Once submitted, a rating is locked in."}
        </p>
      </div>

      {!live?.participant_id ? (
        <Card padding="md" className="flex items-center gap-4">
          <div className="bg-border-light flex size-10 shrink-0 items-center justify-center rounded-full">
            <Icon icon={Mic} size="md" className="text-text-secondary" />
          </div>
          <p className="text-body text-text-secondary">
            Waiting for the organizer to start the next performance…
          </p>
        </Card>
      ) : (
        <Card padding="md" className="space-y-5">
          <div>
            <p className="text-small text-text-secondary font-medium tracking-wide uppercase">
              Now performing
            </p>
            <p className="text-heading text-text-primary font-extrabold">
              {live.participant_name}
            </p>
          </div>

          {error && <Banner tone="danger">{error}</Banner>}

          {ratingNotStarted ? (
            <div className="border-border-light bg-surface-light flex items-center gap-3 rounded-md border p-4">
              <Icon icon={Mic} size="md" className="text-text-secondary shrink-0" />
              <p className="text-body text-text-secondary">
                On stage now — rating opens as soon as the organizer starts it.
              </p>
            </div>
          ) : windowClosed ? (
            <div className="border-border-light bg-surface-light flex items-center gap-3 rounded-md border p-4">
              <Icon
                icon={live.already_rated ? Check : AlertTriangle}
                size="md"
                className={
                  live.already_rated
                    ? "text-success shrink-0"
                    : "text-danger shrink-0"
                }
              />
              <p className="text-body text-text-primary">
                {live.already_rated
                  ? "Rating locked in for this performance."
                  : "Rating window closed — this performance can no longer be rated."}
              </p>
            </div>
          ) : event.ratingMode === "Casual" ? (
            <div className="space-y-3">
              <p className="text-small text-warning font-semibold">
                Reactions are live — tap as many times as you like
              </p>
              <div className="flex justify-center gap-3">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="text-3xl transition-transform active:scale-90"
                    onClick={() => {
                      if (live.participant_id) {
                        void submitReaction(
                          attendeeId!,
                          live.participant_id,
                          emoji,
                        );
                      }
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : live.already_rated ? (
            <div className="border-border-light bg-surface-light flex items-center gap-3 rounded-md border p-4">
              <Icon icon={Check} size="md" className="text-success shrink-0" />
              <p className="text-body text-text-primary">
                Rating locked in — {secondsLeft}s left in this window.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-small text-warning font-semibold">
                {secondsLeft}s left to rate
              </p>
              <div className="flex items-baseline justify-between">
                <p className="text-small text-text-secondary">Your rating</p>
                <p className="text-heading text-text-primary font-extrabold">
                  {rating.toFixed(1)}
                </p>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={rating}
                disabled={submitting}
                onChange={(e) => setRating(Number(e.target.value))}
                className="accent-primary w-full"
              />
              <div className="text-small text-text-secondary flex justify-between">
                <span>0</span>
                <span>10</span>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Saving…" : "Submit Rating"}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

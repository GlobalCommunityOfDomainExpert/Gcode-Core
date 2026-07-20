"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Compass, Mic } from "lucide-react";
import { Card, Icon } from "@/components/atoms";
import { NotFoundState } from "@/components/molecules";
import { useEvent } from "@/hooks/use-event";
import { LivePerformer } from "@/lib/api/ratings";

// Public big-screen display — no attendee identity needed, just shows
// whoever the organizer has marked as currently performing plus their live
// score. Same SSE stream as the rate page, just without an attendee_id (so
// `already_rated` on the payload is meaningless here and ignored).
export default function ScoreboardPage() {
  const params = useParams<{ id: string }>();
  const { event } = useEvent(params.id);
  const [live, setLive] = useState<LivePerformer | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!params.id) return;
    const source = new EventSource(
      `/api/events/${params.id}/live-performer/stream`,
    );
    source.onmessage = (e) => {
      const data: LivePerformer = JSON.parse(e.data);
      setLive(data);
    };
    return () => source.close();
  }, [params.id]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!event) {
    return (
      <NotFoundState
        icon={Compass}
        title="Loading…"
        description="Fetching this event."
        actionHref="/events"
        actionLabel="Browse Events"
      />
    );
  }

  const windowClosesAtMs = live?.window_closes_at
    ? new Date(live.window_closes_at).getTime()
    : null;
  const secondsLeft = windowClosesAtMs
    ? Math.max(0, Math.ceil((windowClosesAtMs - now) / 1000))
    : 0;
  const windowOpen = live?.participant_id ? secondsLeft > 0 : false;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center space-y-8 text-center">
      <p className="text-small text-text-secondary font-medium tracking-widest uppercase">
        {event.title}
      </p>

      {!live?.participant_id ? (
        <Card padding="md" className="flex flex-col items-center gap-4 px-12 py-10">
          <Icon icon={Mic} size="lg" className="text-text-secondary" />
          <p className="text-heading text-text-secondary">
            Waiting for the next performance…
          </p>
        </Card>
      ) : (
        <Card padding="md" className="w-full space-y-6 px-12 py-10">
          <div className="space-y-1">
            <p className="text-small text-text-secondary font-medium tracking-widest uppercase">
              Now Performing
            </p>
            <p className="text-display text-text-primary font-extrabold">
              {live.participant_name}
            </p>
          </div>

          <div className="border-border-light border-t pt-6">
            {live.rating_count > 0 ? (
              <>
                <p className="text-display text-primary font-extrabold">
                  {live.avg_rating?.toFixed(1)}
                  <span className="text-heading text-text-secondary font-semibold">
                    {" "}
                    / 100
                  </span>
                </p>
                <p className="text-small text-text-secondary">
                  {live.rating_count} rating{live.rating_count === 1 ? "" : "s"}{" "}
                  so far
                </p>
              </>
            ) : (
              <p className="text-body text-text-secondary">No ratings yet</p>
            )}
          </div>

          <p className="text-small text-text-secondary">
            {windowOpen
              ? `${secondsLeft}s left to rate`
              : "Rating window closed"}
          </p>
        </Card>
      )}
    </div>
  );
}

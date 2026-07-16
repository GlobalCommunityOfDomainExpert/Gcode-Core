"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AlertTriangle, Clock, Compass, ExternalLink } from "lucide-react";
import { Button, Card, Icon, Input, Label, SectionLabel } from "@/components/atoms";
import { Banner, ChecklistItem, NotFoundState } from "@/components/molecules";
import { useEvent } from "@/hooks/use-event";
import { getParticipant, submitParticipantAudio } from "@/lib/api/participants";
import { ApiError } from "@/lib/api/client";
import { ParticipantApi } from "@/lib/api/types";

const SUBMISSION_WINDOW_MS = 24 * 60 * 60 * 1000;

function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function AdditionalInfoPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const participantId = searchParams.get("pid");
  const { event } = useEvent(params.id);

  const [participant, setParticipant] = useState<ParticipantApi | undefined>();
  const [participantStatus, setParticipantStatus] = useState<
    "loading" | "error" | "ready"
  >(participantId ? "loading" : "error");

  const [audioUrl, setAudioUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  // Re-renders every 30s so the countdown/disqualification state stays live
  // without the participant having to refresh the page.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!participantId) return;
    let cancelled = false;
    void (async () => {
      try {
        const row = await getParticipant(participantId);
        if (cancelled) return;
        if (!row) {
          setParticipantStatus("error");
          return;
        }
        setParticipant(row);
        setSubmittedUrl(row.audio_submission_url ?? null);
        setParticipantStatus("ready");
      } catch {
        if (!cancelled) setParticipantStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [participantId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!event || participantStatus === "loading") {
    return (
      <NotFoundState
        icon={Compass}
        title="Loading your registration…"
        description="Fetching your additional info."
        actionHref="/events"
        actionLabel="Browse Events"
      />
    );
  }

  if (participantStatus === "error" || !participant) {
    return (
      <NotFoundState
        icon={Compass}
        title="Registration not found"
        description="We couldn't find this registration. Check the link from your confirmation email."
        actionHref={`/events/${event.id}`}
        actionLabel="Back to Event"
      />
    );
  }

  if (participant.category !== "PARTICIPANT") {
    return (
      <NotFoundState
        icon={Compass}
        title="Nothing to submit"
        description="Additional info is only required for Participant-category registrations."
        actionHref={`/events/${event.id}`}
        actionLabel="Back to Event"
      />
    );
  }

  const deadline = new Date(
    new Date(participant.applied_on).getTime() + SUBMISSION_WINDOW_MS,
  );
  const msRemaining = deadline.getTime() - now.getTime();
  const isPastDeadline = msRemaining <= 0;
  const isDisqualified = isPastDeadline && !submittedUrl;

  async function handleSubmit() {
    if (!isValidUrl(audioUrl.trim())) {
      setError("Enter a valid link (e.g. a Google Drive share URL).");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { audio_submission_url } = await submitParticipantAudio(
        participant!.id,
        audioUrl.trim(),
      );
      setSubmittedUrl(audio_submission_url);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't save your submission. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-large text-text-primary font-bold">
          Additional Info — {event.title}
        </h1>
        <p className="text-small text-text-secondary">
          Participants must submit their audio submission URL within 24
          hours of registration, or the entry is disqualified.
        </p>
      </div>

      {isDisqualified ? (
        <Banner tone="danger" icon={AlertTriangle}>
          The 24-hour submission window closed on{" "}
          {deadline.toLocaleString()} and no audio was submitted. This entry
          is disqualified. Contact the organizer if you believe this is a
          mistake.
        </Banner>
      ) : submittedUrl ? (
        <Banner tone="success">
          Audio submitted. You can replace it until the deadline below.
        </Banner>
      ) : (
        <Banner tone="warning" icon={Clock}>
          {formatCountdown(msRemaining)} left to submit — deadline{" "}
          {deadline.toLocaleString()}.
        </Banner>
      )}

      {error && <Banner tone="danger">{error}</Banner>}

      {!isDisqualified && (
        <Card padding="md" className="space-y-4">
          <SectionLabel>How to submit</SectionLabel>
          <div className="space-y-3">
            <ChecklistItem
              label="Upload your audio file"
              subtext="Any host works — Google Drive, Dropbox, OneDrive, etc."
            />
            <ChecklistItem
              label='Set sharing to "Anyone with the link"'
              subtext='On Google Drive: right-click the file → Share → General access → "Anyone with the link" (Viewer is enough). A private link the reviewer can&apos;t open counts as no submission.'
            />
            <ChecklistItem
              label="Copy the link and paste it below, then submit"
              subtext="Before the 24h deadline — after that the entry is disqualified regardless of the file itself."
            />
          </div>

          <SectionLabel>Additional Info</SectionLabel>
          <div className="space-y-1">
            <Label htmlFor="audio-url">Audio Submission URL</Label>
            <Input
              id="audio-url"
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting || audioUrl.trim() === ""}
          >
            {submitting
              ? "Saving…"
              : submittedUrl
                ? "Replace Submission"
                : "Submit"}
          </Button>
          {submittedUrl && (
            <a
              href={submittedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-small text-primary flex items-center gap-1"
            >
              View current submission <Icon icon={ExternalLink} size="sm" />
            </a>
          )}
        </Card>
      )}
    </div>
  );
}

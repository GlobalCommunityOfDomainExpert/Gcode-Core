"use client";

import { ReactNode, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Check,
  Clock,
  Compass,
  ExternalLink,
  LucideIcon,
} from "lucide-react";
import {
  Button,
  Card,
  Icon,
  Input,
  Label,
  SectionLabel,
} from "@/components/atoms";
import {
  AudioRecorder,
  Banner,
  NotFoundState,
  ToggleGroup,
} from "@/components/molecules";
import { useEvent } from "@/hooks/use-event";
import {
  getParticipant,
  submitParticipantAudio,
  uploadParticipantAudio,
} from "@/lib/api/participants";
import { ApiError } from "@/lib/api/client";
import { ParticipantApi } from "@/lib/api/types";

const SUBMISSION_WINDOW_MS = 24 * 60 * 60 * 1000;

type SubmissionMode = "record" | "link";

const SUBMISSION_MODE_OPTIONS: { value: SubmissionMode; label: string }[] = [
  { value: "record", label: "Record Audio" },
  { value: "link", label: "Paste a Link" },
];

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

// Neutral card + small tone-colored icon badge — same pattern as the
// registered page's success/reminder cards, instead of a solid-fill
// Banner. Used for all three submission-status states below so they read
// as one consistent alert style rather than three different color blocks.
const statusTone = {
  danger: { badge: "bg-danger-light", icon: "text-danger" },
  success: { badge: "bg-success-light", icon: "text-success" },
  warning: { badge: "bg-warning-light", icon: "text-warning" },
} as const;

function StatusCard({
  tone,
  icon,
  children,
}: {
  tone: keyof typeof statusTone;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="border-border-light bg-surface-light flex items-center gap-4 rounded-md border p-6">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${statusTone[tone].badge}`}
      >
        <Icon icon={icon} size="md" className={statusTone[tone].icon} />
      </div>
      <p className="text-body text-text-primary">{children}</p>
    </div>
  );
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

  const [mode, setMode] = useState<SubmissionMode>("record");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
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
    if (mode === "record") {
      if (!audioBlob) return;
    } else {
      if (!isValidUrl(audioUrl.trim())) {
        setError("Enter a valid link (e.g. a Google Drive or YouTube URL).");
        return;
      }
    }
    setSubmitting(true);
    setError("");
    try {
      const { audio_submission_url } =
        mode === "record"
          ? await uploadParticipantAudio(participant!.id, audioBlob!)
          : await submitParticipantAudio(participant!.id, audioUrl.trim());
      setSubmittedUrl(audio_submission_url);
      setAudioBlob(null);
      setAudioUrl("");
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
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
          Participants must submit their audio submission URL within 24 hours of
          registration, or the entry is disqualified.
        </p>
      </div>

      {isDisqualified ? (
        <StatusCard tone="danger" icon={AlertTriangle}>
          The 24-hour submission window closed on {deadline.toLocaleString()}{" "}
          and no audio was submitted. This entry is disqualified. Contact the
          organizer if you believe this is a mistake.
        </StatusCard>
      ) : submittedUrl ? (
        <StatusCard tone="success" icon={Check}>
          Audio submitted. You can replace it until the deadline below.
        </StatusCard>
      ) : (
        <StatusCard tone="warning" icon={Clock}>
          {formatCountdown(msRemaining)} left to submit — deadline{" "}
          {deadline.toLocaleString()}.
        </StatusCard>
      )}

      {error && <Banner tone="danger">{error}</Banner>}

      {!isDisqualified && (
        <Card padding="md" className="space-y-4">
          <SectionLabel>Submit your audio</SectionLabel>
          <ToggleGroup
            options={SUBMISSION_MODE_OPTIONS}
            value={mode}
            onChange={(value) => setMode(value as SubmissionMode)}
          />

          {mode === "record" ? (
            <>
              <p className="text-small text-text-secondary">
                Up to 3 minutes. Record right here in the browser, then submit
                before the 24h deadline — after that the entry is disqualified
                regardless of the recording itself.
              </p>
              <AudioRecorder
                onRecordingComplete={setAudioBlob}
                onClear={() => setAudioBlob(null)}
                disabled={submitting}
              />
            </>
          ) : (
            <>
              <p className="text-small text-text-secondary">
                Upload to Google Drive or YouTube (unlisted is fine), set
                sharing to &quot;Anyone with the link&quot;, then paste it
                below. A private link the reviewer can&apos;t open counts as no
                submission.
              </p>
              <div className="space-y-1">
                <Label htmlFor="audio-url">Audio Submission URL</Label>
                <Input
                  id="audio-url"
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or https://youtu.be/..."
                />
              </div>
            </>
          )}

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={
              submitting ||
              (mode === "record" ? !audioBlob : audioUrl.trim() === "")
            }
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

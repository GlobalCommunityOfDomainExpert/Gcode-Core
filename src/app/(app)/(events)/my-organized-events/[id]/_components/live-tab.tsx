"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, ButtonLink, Select } from "@/components/atoms";
import { Banner, Table, TableColumn, ToggleGroup } from "@/components/molecules";
import { Attendee } from "@/lib/attendees";
import { Event } from "@/lib/event";
import { updateEvent } from "@/lib/api/events";
import {
  getLivePerformer,
  getPerformedParticipants,
  sendRatingLinks,
  setLivePerformer,
  startRatingWindow,
} from "@/lib/api/ratings";
import { ApiError } from "@/lib/api/client";

export interface LiveTabProps {
  event: Event;
  attendees: Attendee[];
}

export function LiveTab({ event, attendees }: LiveTabProps) {
  const participants = useMemo(
    () => attendees.filter((a) => a.category === "Participant"),
    [attendees],
  );

  const [currentId, setCurrentId] = useState<string | null>(null);
  // Whether the on-stage performer's audience rating window is currently
  // open — distinct from currentId: bringing someone on stage no longer
  // opens the window by itself, Start Rating does that explicitly.
  const [ratingOpen, setRatingOpen] = useState(false);
  const [performedIds, setPerformedIds] = useState<Set<string>>(new Set());
  const [settingId, setSettingId] = useState<string | null>(null);
  const [startingRating, setStartingRating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // Settable any time, independent of who's on stage — mode is orthogonal
  // to the current-performer/rating-window mechanic below.
  const [ratingMode, setRatingModeLocal] = useState(event.ratingMode);
  const [modeSaving, setModeSaving] = useState(false);
  // "" until the organizer touches the picker — defaults to whoever's
  // already live, falling back to the first participant, without an effect
  // fighting the organizer's own selection once they've made one.
  const [selectedId, setSelectedId] = useState("");
  const effectiveSelectedId =
    selectedId || currentId || participants[0]?.id || "";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const state = await getLivePerformer(event.id);
        if (cancelled) return;
        // ORDS omits the key entirely rather than sending JSON null when no
        // performer is set — state.participant_id comes back `undefined`,
        // not `null`, so both must be treated as "no one on stage."
        if (state.participant_id != null) {
          setCurrentId(String(state.participant_id));
        }
        setRatingOpen(
          !!state.window_closes_at &&
            new Date(state.window_closes_at).getTime() > Date.now(),
        );
      } catch {
        // best-effort — organizer can still set a performer without this
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [event.id]);

  async function refreshPerformed() {
    try {
      const items = await getPerformedParticipants(event.id);
      setPerformedIds(new Set(items.map((i) => String(i.participant_id))));
    } catch {
      // best-effort — badge just won't show if this fails
    }
  }

  useEffect(() => {
    void refreshPerformed();
  }, [event.id]);

  async function handleSelectPerformer(participantId: string) {
    setSettingId(participantId);
    setError("");
    try {
      await setLivePerformer(event.id, participantId);
      setCurrentId(participantId);
      // Bringing someone new on stage closes any rating window still open
      // for the previous performer.
      setRatingOpen(false);
      void refreshPerformed();
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Couldn't update the current performer.",
      );
    } finally {
      setSettingId(null);
    }
  }

  async function handleStartRating() {
    setStartingRating(true);
    setError("");
    try {
      await startRatingWindow(event.id);
      setRatingOpen(true);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Couldn't start the rating window.",
      );
    } finally {
      setStartingRating(false);
    }
  }

  async function handleModeChange(value: string) {
    const previous = ratingMode;
    const next = value === "Casual" ? "Casual" : "Competitive";
    setRatingModeLocal(next);
    setModeSaving(true);
    setError("");
    try {
      await updateEvent(event.id, {
        rating_mode: next === "Casual" ? "CASUAL" : "COMPETITIVE",
      });
    } catch (err) {
      setRatingModeLocal(previous);
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Couldn't update the rating mode.",
      );
    } finally {
      setModeSaving(false);
    }
  }

  async function handleSendLinks() {
    if (
      !window.confirm(
        "Email every attendee their unique rating link now? This sends immediately.",
      )
    ) {
      return;
    }
    setSending(true);
    setError("");
    setNotice("");
    try {
      const { sent } = await sendRatingLinks(event.id);
      setNotice(`Sent to ${sent} attendee${sent === 1 ? "" : "s"}.`);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Couldn't send rating links.",
      );
    } finally {
      setSending(false);
    }
  }

  const columns: TableColumn<Attendee>[] = [
    {
      key: "name",
      header: "Participant",
      render: (row) => <span className="text-text-primary">{row.name}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) =>
        currentId === row.id ? (
          <Badge variant="muted" tone="success" size="sm">
            Now performing
          </Badge>
        ) : performedIds.has(row.id) ? (
          <Badge variant="muted" tone="neutral" size="sm">
            Performed
          </Badge>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-body text-text-primary font-semibold">
            Live Rating
          </p>
          <p className="text-small text-text-secondary">
            Mark who's performing now — attendees with a rating link see this
            update live.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={modeSaving ? "pointer-events-none opacity-50" : ""}>
            <ToggleGroup
              options={[
                { value: "Competitive", label: "Competitive" },
                { value: "Casual", label: "Casual" },
              ]}
              value={ratingMode}
              onChange={handleModeChange}
            />
          </div>
          <ButtonLink
            href={`/events/${event.id}/scoreboard`}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="sm"
          >
            Open Scoreboard
          </ButtonLink>
          <Button variant="secondary" size="sm" disabled={sending} onClick={handleSendLinks}>
            {sending ? "Sending…" : "Send Rating Links"}
          </Button>
        </div>
      </div>

      {error && <Banner tone="danger">{error}</Banner>}
      {notice && <Banner tone="success">{notice}</Banner>}

      <div className="border-border-light bg-surface-light flex flex-wrap items-end gap-3 rounded-md border p-4">
        <div className="min-w-48 flex-1 space-y-1">
          <label className="text-small text-text-secondary font-medium">
            Current Performer
          </label>
          <Select
            value={effectiveSelectedId}
            disabled={participants.length === 0 || settingId !== null}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {participants.length === 0 && <option value="">—</option>}
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="secondary"
          disabled={
            !effectiveSelectedId ||
            settingId !== null ||
            effectiveSelectedId === currentId
          }
          onClick={() => handleSelectPerformer(effectiveSelectedId)}
        >
          {settingId === effectiveSelectedId
            ? "Selecting…"
            : effectiveSelectedId === currentId
              ? "On Stage"
              : "Select Performer"}
        </Button>
        <Button
          variant="primary"
          disabled={
            !effectiveSelectedId ||
            effectiveSelectedId !== currentId ||
            startingRating ||
            ratingOpen
          }
          onClick={handleStartRating}
        >
          {startingRating
            ? "Starting…"
            : ratingOpen && effectiveSelectedId === currentId
              ? "Rating Open"
              : "Start Rating"}
        </Button>
      </div>

      <Table
        columns={columns}
        rows={participants}
        rowKey={(row) => row.id}
        emptyState={
          <p className="text-body text-text-secondary p-6 text-center">
            No Participant-category registrations yet.
          </p>
        }
      />
    </div>
  );
}

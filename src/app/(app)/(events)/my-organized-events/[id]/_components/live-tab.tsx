"use client";

import { useEffect, useState } from "react";
import { Badge, Button, ButtonLink } from "@/components/atoms";
import { Banner, Table, TableColumn } from "@/components/molecules";
import { Attendee } from "@/lib/attendees";
import { Event } from "@/lib/event";
import {
  getLivePerformer,
  getPerformedParticipants,
  sendRatingLinks,
  setLivePerformer,
} from "@/lib/api/ratings";
import { ApiError } from "@/lib/api/client";

export interface LiveTabProps {
  event: Event;
  attendees: Attendee[];
}

export function LiveTab({ event, attendees }: LiveTabProps) {
  const participants = attendees.filter((a) => a.category === "Participant");

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [performedIds, setPerformedIds] = useState<Set<string>>(new Set());
  const [settingId, setSettingId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const state = await getLivePerformer(event.id);
        if (!cancelled && state.participant_id !== null) {
          setCurrentId(String(state.participant_id));
        }
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

  async function handleSetCurrent(participantId: string) {
    setSettingId(participantId);
    setError("");
    try {
      await setLivePerformer(event.id, participantId);
      setCurrentId(participantId);
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
    {
      key: "action",
      header: "",
      render: (row) => (
        <Button
          variant={currentId === row.id ? "secondary" : "primary"}
          size="sm"
          disabled={settingId !== null}
          onClick={() => handleSetCurrent(row.id)}
        >
          {settingId === row.id
            ? "Setting…"
            : currentId === row.id
              ? "Current"
              : "Set as Current"}
        </Button>
      ),
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
        <div className="flex gap-2">
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

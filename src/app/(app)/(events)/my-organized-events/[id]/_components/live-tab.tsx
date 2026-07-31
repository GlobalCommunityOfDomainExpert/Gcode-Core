"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, ButtonLink, Select } from "@/components/atoms";
import { Banner, Table, TableColumn, ToggleGroup } from "@/components/molecules";
import { Attendee } from "@/lib/attendees";
import { Event, EventPanelist } from "@/lib/event";
import {
  blendedFinalScore,
  currentRoundStatus,
  judgeScoreOutOf100,
  resolveLiveRound,
  RoundDecision,
  RoundScore,
  scoresByJudge,
} from "@/lib/rounds";
import { updateEvent } from "@/lib/api/events";
import { listRoundDecisions, listRoundScores } from "@/lib/api/rounds";
import { listEventPanelists } from "@/lib/api/panelists";
import {
  adaptEventPanelist,
  adaptRoundDecision,
  adaptRoundScore,
} from "@/lib/api/adapters";
import {
  getLivePerformer,
  getPerformedParticipants,
  listRoundRatings,
  RoundRatingSummary,
  sendRatingLinks,
  setLivePerformer,
  startRatingWindow,
} from "@/lib/api/ratings";
import { ApiError } from "@/lib/api/client";

const LIVE_JUDGING_POLL_MS = 3000;

export interface LiveTabProps {
  event: Event;
  attendees: Attendee[];
}

export function LiveTab({ event, attendees }: LiveTabProps) {
  const allParticipants = useMemo(
    () => attendees.filter((a) => a.category === "Participant"),
    [attendees],
  );

  // Event-wide decisions (not scoped to one round) — resolveLiveRound needs
  // the full lock chain across every round to find the current frontier, not
  // just the round immediately before whichever round used to be hardcoded
  // as "the" live one.
  const [decisions, setDecisions] = useState<RoundDecision[]>([]);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const items = await listRoundDecisions(event.id);
        if (!cancelled) setDecisions(items.map(adaptRoundDecision));
      } catch {
        // best-effort — falls back to "everyone eligible" below
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [event.id]);

  // "Offline" is synonymous with "live-judged" — the live round is whichever
  // Offline round is currently the unlocked/active one (see resolveLiveRound
  // in lib/rounds.ts), not just the last Offline round in the event.
  const { liveRound, previousRound } = resolveLiveRound(
    event.rounds,
    decisions,
    allParticipants.map((p) => p.id),
  );

  const participants = previousRound
    ? allParticipants.filter(
        (p) =>
          currentRoundStatus(decisions, p.id, previousRound.id) ===
          "SHORTLISTED",
      )
    : allParticipants;

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
    let cancelled = false;
    void (async () => {
      try {
        const items = await getPerformedParticipants(event.id);
        if (!cancelled) {
          setPerformedIds(new Set(items.map((i) => String(i.participant_id))));
        }
      } catch {
        // best-effort — badge just won't show if this fails
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [event.id]);

  // Live Judging panel data — panelist scores, live audience average, and
  // the leaderboard all poll together while a live round exists. Separate
  // from the currentId effect above (which only runs once on mount) since
  // this needs to keep refreshing for the blend/leaderboard to feel live.
  const [panelists, setPanelists] = useState<EventPanelist[]>([]);
  const [roundScores, setRoundScores] = useState<RoundScore[]>([]);
  const [roundRatings, setRoundRatings] = useState<RoundRatingSummary[]>([]);
  const [currentAvgRating, setCurrentAvgRating] = useState<number | null>(null);

  useEffect(() => {
    if (!liveRound) return;
    let cancelled = false;
    async function poll() {
      try {
        const [panelistItems, scoreItems, ratingItems, performerState] =
          await Promise.all([
            listEventPanelists(event.id),
            listRoundScores(event.id, liveRound!.id),
            listRoundRatings(event.id, liveRound!.id),
            getLivePerformer(event.id),
          ]);
        if (cancelled) return;
        setPanelists(
          panelistItems.map(adaptEventPanelist).filter((p) => p.status === "ACCEPTED"),
        );
        setRoundScores(scoreItems.map(adaptRoundScore));
        setRoundRatings(ratingItems);
        setCurrentAvgRating(performerState.avg_rating);
      } catch {
        // best-effort — panel just shows stale/empty data until next tick
      }
    }
    void poll();
    const interval = setInterval(poll, LIVE_JUDGING_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id, liveRound?.id]);

  const currentJudgeScore100 =
    liveRound && currentId
      ? judgeScoreOutOf100(liveRound.rubric, roundScores, currentId, liveRound.id)
      : undefined;
  const currentAudienceScore100 =
    ratingMode === "Competitive" ? (currentAvgRating ?? undefined) : undefined;
  const currentBlended = liveRound
    ? blendedFinalScore(liveRound, currentJudgeScore100, currentAudienceScore100)
    : undefined;

  const currentPanelistScores = liveRound
    ? panelists.map((p) => {
        const perCriterion = currentId
          ? (scoresByJudge(roundScores, currentId, liveRound.id)[p.userId ?? ""] ?? {})
          : {};
        const values = Object.values(perCriterion);
        return {
          panelist: p,
          total: values.length > 0 ? values.reduce((a, b) => a + b, 0) : undefined,
        };
      })
    : [];

  const leaderboard = liveRound
    ? Array.from(performedIds)
        .map((participantId) => {
          const participant = allParticipants.find((p) => p.id === participantId);
          const judgeScore100 = judgeScoreOutOf100(
            liveRound.rubric,
            roundScores,
            participantId,
            liveRound.id,
          );
          const audienceScore100 =
            ratingMode === "Competitive"
              ? roundRatings.find((r) => String(r.participant_id) === participantId)
                  ?.avg_rating
              : undefined;
          return {
            participantId,
            name: participant?.name ?? "Unknown",
            final: blendedFinalScore(liveRound, judgeScore100, audienceScore100),
          };
        })
        .sort((a, b) => (b.final ?? -1) - (a.final ?? -1))
    : [];

  async function handleSelectPerformer(participantId: string) {
    setSettingId(participantId);
    setError("");
    try {
      await setLivePerformer(event.id, participantId, liveRound?.id);
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
            Mark who&apos;s performing now — attendees with a rating link see
            this update live.
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
      {previousRound && (
        <Banner tone="info">
          Only participants Shortlisted in &quot;{previousRound.name}&quot;
          are eligible to perform in &quot;{liveRound?.name}&quot;.
        </Banner>
      )}

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
            {previousRound
              ? `No one's been Shortlisted from "${previousRound.name}" yet.`
              : "No Participant-category registrations yet."}
          </p>
        }
      />

      {liveRound && (
        <div className="space-y-4 border-t border-border-light pt-6">
          <div>
            <p className="text-body text-text-primary font-semibold">
              Live Judging — {liveRound.name}
            </p>
            <p className="text-small text-text-secondary">
              Panelists score the current performer against this round&apos;s
              rubric in real time. Final score blends judge and audience
              scores {liveRound.judgeWeight}/{liveRound.audienceWeight}.
            </p>
          </div>

          {currentId && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border-border-light bg-surface-light rounded-md border p-4">
                <p className="text-small text-text-secondary uppercase tracking-wide">
                  Judge Score
                </p>
                <p className="text-heading text-text-primary font-bold">
                  {currentJudgeScore100 !== undefined
                    ? `${currentJudgeScore100.toFixed(1)} / 100`
                    : "—"}
                </p>
              </div>
              <div className="border-border-light bg-surface-light rounded-md border p-4">
                <p className="text-small text-text-secondary uppercase tracking-wide">
                  Audience Score
                </p>
                <p className="text-heading text-text-primary font-bold">
                  {currentAudienceScore100 !== undefined
                    ? `${currentAudienceScore100.toFixed(1)} / 100`
                    : "—"}
                </p>
              </div>
              <div className="border-border-light bg-surface-light rounded-md border p-4">
                <p className="text-small text-text-secondary uppercase tracking-wide">
                  Final Score
                </p>
                <p className="text-heading text-primary font-bold">
                  {currentBlended !== undefined
                    ? `${currentBlended.toFixed(1)} / 100`
                    : "—"}
                </p>
              </div>
            </div>
          )}

          {currentId && panelists.length > 0 && (
            <div className="space-y-2">
              <p className="text-small text-text-secondary font-medium">
                Panelist scores for the current performer
              </p>
              <Table
                columns={[
                  {
                    key: "panelist",
                    header: "Panelist",
                    render: (row: (typeof currentPanelistScores)[number]) => (
                      <span className="text-text-primary">
                        {row.panelist.invitedEmail}
                      </span>
                    ),
                  },
                  {
                    key: "total",
                    header: "Score",
                    render: (row: (typeof currentPanelistScores)[number]) => (
                      <span className="text-text-primary">
                        {row.total !== undefined
                          ? `${row.total} / ${liveRound.rubric.reduce((s, c) => s + c.maxScore, 0)}`
                          : "Not yet scored"}
                      </span>
                    ),
                  },
                ]}
                rows={currentPanelistScores}
                rowKey={(row) => row.panelist.id}
              />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-small text-text-secondary font-medium">
              Live Leaderboard
            </p>
            <Table
              columns={[
                {
                  key: "rank",
                  header: "#",
                  render: (row: (typeof leaderboard)[number]) => (
                    <span className="text-text-secondary">
                      {leaderboard.indexOf(row) + 1}
                    </span>
                  ),
                },
                {
                  key: "name",
                  header: "Participant",
                  render: (row: (typeof leaderboard)[number]) => (
                    <span className="text-text-primary">{row.name}</span>
                  ),
                },
                {
                  key: "final",
                  header: "Final Score",
                  render: (row: (typeof leaderboard)[number]) => (
                    <span className="text-text-primary font-medium">
                      {row.final !== undefined ? row.final.toFixed(1) : "—"}
                    </span>
                  ),
                },
              ]}
              rows={leaderboard}
              rowKey={(row) => row.participantId}
              emptyState={
                <p className="text-body text-text-secondary p-6 text-center">
                  No one has performed yet.
                </p>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

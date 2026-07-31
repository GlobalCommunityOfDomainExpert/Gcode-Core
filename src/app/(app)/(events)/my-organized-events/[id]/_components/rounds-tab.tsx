"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Input } from "@/components/atoms";
import {
  Banner,
  BulkActionBar,
  FormField,
  Modal,
  Table,
  TableColumn,
  Tabs,
} from "@/components/molecules";
import { Attendee, isUploadedAudioUrl } from "@/lib/attendees";
import { Event, EventPanelist } from "@/lib/event";
import {
  computeAutoShortlist,
  currentRoundStatus,
  currentRoundScores,
  isRoundDecided,
  isRoundFullyScored,
  myRoundScores,
  rankByTotalScore,
  RoundDecision,
  RoundScore,
  scoresByJudge,
  totalRubricScore,
} from "@/lib/rounds";
import {
  decideRoundStatus,
  listRoundDecisions,
  listRoundScores,
  submitRoundScore,
} from "@/lib/api/rounds";
import { listEventPanelists } from "@/lib/api/panelists";
import {
  adaptEventPanelist,
  adaptRoundDecision,
  adaptRoundScore,
} from "@/lib/api/adapters";
import { ApiError } from "@/lib/api/client";
import { useSession } from "@/hooks/use-session";
import { roundDecisionLabel, roundDecisionTone } from "./status-maps";

export interface RoundsTabProps {
  event: Event;
  attendees: Attendee[];
  // "organizer" (default) never scores — every round shows a read-only
  // breakdown (total, rank, who scored what) instead of a Score button.
  // "panelist" can score Online rounds only — Offline rounds are
  // live-judged exclusively via the Live Judging tab's current-performer
  // flow, so this table stays read-only for Offline rounds regardless of
  // viewer.
  viewerRole?: "organizer" | "panelist";
  // Locks the table to a single round with no round switcher — the judge
  // page's active-round-only view, so a panelist can't browse rounds beyond
  // whichever one is currently open.
  onlyRoundId?: string;
}

export function RoundsTab({
  event,
  attendees,
  viewerRole = "organizer",
  onlyRoundId,
}: RoundsTabProps) {
  const session = useSession();
  const participants = useMemo(
    () => attendees.filter((a) => a.category === "Participant"),
    [attendees],
  );

  const [internalActiveRoundId, setInternalActiveRoundId] = useState(
    event.rounds[0]?.id ?? "",
  );
  const activeRoundId = onlyRoundId ?? internalActiveRoundId;
  // Scoring happens in a modal (one participant, every criterion at once)
  // rather than as inline table columns — a rubric with many criteria would
  // otherwise force the table wider than any reasonable screen.
  const [scoringParticipantId, setScoringParticipantId] = useState<
    string | null
  >(null);
  const [decisions, setDecisions] = useState<RoundDecision[]>([]);
  const [scores, setScores] = useState<RoundScore[]>([]);
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
  const [submittingScores, setSubmittingScores] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState("");
  // Every ACCEPTED panelist's userId for this event — the set auto-shortlist
  // waits on before treating a round as "fully scored." Empty when no
  // panelists have been invited/accepted, which isRoundFullyScored treats
  // as single-scorer mode (any one score counts), matching pre-panelist
  // behavior for events that don't use panelists at all.
  const [expectedJudgeIds, setExpectedJudgeIds] = useState<string[]>([]);
  // Full accepted-panelist objects (not just their ids) — the read-only
  // "scored by" breakdown labels each judge by invitedEmail, the only
  // identifying field EventPanelist actually has.
  const [panelists, setPanelists] = useState<EventPanelist[]>([]);

  async function refreshDecisions() {
    try {
      const items = await listRoundDecisions(event.id);
      setDecisions(items.map(adaptRoundDecision));
    } catch {
      // best-effort — badges just won't show if this fails
    }
  }

  async function refreshScores() {
    try {
      const items = await listRoundScores(event.id);
      setScores(items.map(adaptRoundScore));
    } catch {
      // best-effort — score cells just show blank if this fails
    }
  }

  useEffect(() => {
    void refreshDecisions();
    void refreshScores();
    void (async () => {
      const items = await listEventPanelists(event.id);
      const accepted = items
        .map(adaptEventPanelist)
        .filter((p) => p.status === "ACCEPTED" && p.userId);
      // A userId can have more than one ACCEPTED row (re-invited after
      // leaving, duplicate invite, etc.) — dedupe so "scored by" doesn't
      // list the same judge twice and expectedJudgeIds doesn't double-count
      // them in isRoundFullyScored's "every judge scored" check.
      const seen = new Set<string>();
      const deduped = accepted.filter((p) => {
        if (seen.has(p.userId as string)) return false;
        seen.add(p.userId as string);
        return true;
      });
      setPanelists(deduped);
      setExpectedJudgeIds(deduped.map((p) => p.userId as string));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  // Auto-shortlist: once every participant has a score for every rubric
  // criterion in a round configured with a shortlistCount, rank the
  // still-undecided participants and Shortlist/Reject them automatically.
  // Only acts on participants with no existing decision — see
  // computeAutoShortlist's own comment — so once a round's fully resolved
  // this becomes a no-op on every subsequent render, not a repeat trigger.
  // autoFinalizingRef guards against firing a second overlapping batch of
  // decideRoundStatus calls (which would send duplicate shortlist emails)
  // while the first batch is still in flight.
  const autoFinalizingRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const round = event.rounds.find((r) => r.id === activeRoundId);
    if (!round || round.rubric.length === 0 || !round.shortlistCount) return;
    if (autoFinalizingRef.current.has(activeRoundId)) return;

    const participantIds = participants.map((p) => p.id);
    if (
      !isRoundFullyScored(
        round.rubric,
        participantIds,
        scores,
        activeRoundId,
        expectedJudgeIds,
      )
    ) {
      return;
    }

    const { shortlistIds, rejectIds } = computeAutoShortlist(
      round.rubric,
      participantIds,
      scores,
      decisions,
      activeRoundId,
      round.shortlistCount,
    );
    if (shortlistIds.length === 0 && rejectIds.length === 0) return;

    autoFinalizingRef.current.add(activeRoundId);
    void (async () => {
      try {
        await Promise.all([
          ...shortlistIds.map((id) =>
            decideRoundStatus(id, activeRoundId, "SHORTLISTED"),
          ),
          ...rejectIds.map((id) =>
            decideRoundStatus(id, activeRoundId, "REJECTED"),
          ),
        ]);
        await refreshDecisions();
      } catch (err) {
        setError(
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Couldn't auto-finalize the shortlist for this round.",
        );
      } finally {
        autoFinalizingRef.current.delete(activeRoundId);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    event.rounds,
    activeRoundId,
    participants,
    scores,
    decisions,
    expectedJudgeIds,
  ]);

  // Batches every edited criterion for one participant into one submit —
  // fields just update local drafts on change, nothing hits the server
  // until the modal's Submit button is clicked. Only fields the judge
  // actually touched (present in scoreDrafts) get sent; untouched fields
  // keep whatever they already were.
  async function submitScores(participantId: string) {
    if (!activeRound) return;
    const pending = activeRound.rubric
      .map((criterion) => ({
        criterion,
        draftKey: `${participantId}:${criterion.id}`,
      }))
      .filter(
        ({ draftKey }) =>
          scoreDrafts[draftKey] !== undefined && scoreDrafts[draftKey].trim() !== "",
      );
    if (pending.length === 0) {
      setScoringParticipantId(null);
      return;
    }
    setSubmittingScores(true);
    setError("");
    try {
      await Promise.all(
        pending.map(({ criterion, draftKey }) => {
          const parsed = Math.max(
            0,
            Math.min(criterion.maxScore, Number(scoreDrafts[draftKey])),
          );
          return submitRoundScore(participantId, activeRoundId, criterion.id, parsed);
        }),
      );
      setScoreDrafts((prev) => {
        const next = { ...prev };
        pending.forEach(({ draftKey }) => delete next[draftKey]);
        return next;
      });
      await refreshScores();
      setScoringParticipantId(null);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Couldn't save those scores.",
      );
    } finally {
      setSubmittingScores(false);
    }
  }

  async function decideSelected(status: "SHORTLISTED" | "REJECTED") {
    if (!activeRoundId || selectedIds.size === 0) return;
    setDeciding(true);
    setError("");
    try {
      await Promise.all(
        Array.from(selectedIds).map((participantId) =>
          decideRoundStatus(participantId, activeRoundId, status),
        ),
      );
      setSelectedIds(new Set());
      await refreshDecisions();
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Couldn't update round status for the selected participants.",
      );
    } finally {
      setDeciding(false);
    }
  }

  async function decideOne(
    participantId: string,
    status: "SHORTLISTED" | "REJECTED",
  ) {
    setDeciding(true);
    setError("");
    try {
      await decideRoundStatus(participantId, activeRoundId, status);
      await refreshDecisions();
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Couldn't update round status.",
      );
    } finally {
      setDeciding(false);
    }
  }

  function toggleRow(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? new Set(participants.map((p) => p.id)) : new Set());
  }

  const activeRound = event.rounds.find((r) => r.id === activeRoundId);
  // Once a round has auto-shortlist configured, decisions are set entirely
  // by computeAutoShortlist — manual per-row/bulk actions are hidden so
  // there's no conflicting "who actually decided this" path.
  const autoModeActive = !!activeRound?.shortlistCount;

  // Rounds run in sequence — event.rounds already arrives sorted by
  // sort_order (see the /rounds SQL's ORDER BY), so array index doubles as
  // round order. A round is locked until every participant has a decision
  // on the one immediately before it.
  const participantIds = participants.map((p) => p.id);
  const activeRoundIndex = event.rounds.findIndex(
    (r) => r.id === activeRoundId,
  );
  const previousRound =
    activeRoundIndex > 0 ? event.rounds[activeRoundIndex - 1] : undefined;
  const isActiveRoundLocked =
    !!previousRound &&
    !isRoundDecided(participantIds, decisions, previousRound.id);

  const scoringParticipant = participants.find(
    (p) => p.id === scoringParticipantId,
  );

  // Admin never scores — every round shows a read-only breakdown instead.
  // Panelists can only score Online rounds through this table; Offline
  // rounds are live-judged exclusively via the Live Judging tab's
  // current-performer flow, so this stays read-only there too regardless of
  // viewer.
  const canScoreActiveRound =
    viewerRole === "panelist" && activeRound?.mode === "Online";

  // Rank is only meaningful once every expected judge has scored every
  // participant — a partial rank (whoever happens to be scored so far)
  // would be misleading, not an early preview.
  const roundFullyScored =
    !!activeRound &&
    activeRound.rubric.length > 0 &&
    isRoundFullyScored(
      activeRound.rubric,
      participantIds,
      scores,
      activeRoundId,
      expectedJudgeIds,
    );

  const rankByParticipant =
    activeRound && roundFullyScored
      ? rankByTotalScore(activeRound.rubric, scores, participantIds, activeRoundId)
      : {};

  const columns: TableColumn<Attendee>[] = [
    {
      key: "name",
      header: "Participant",
      render: (row) => <span className="text-text-primary">{row.name}</span>,
    },
    // Online rounds are judged from a remote audio submission — surface it
    // right in the decision table so the organizer doesn't have to jump to
    // the Attendees tab to listen before shortlisting/rejecting. Offline
    // rounds are judged in person, so there's nothing useful to show here.
    ...(activeRound?.mode === "Online"
      ? [
          {
            key: "audio",
            header: "Audio Submission",
            render: (row: Attendee) => {
              if (!row.audioSubmissionUrl) {
                return <span className="text-text-secondary">—</span>;
              }
              if (!isUploadedAudioUrl(row.audioSubmissionUrl)) {
                return (
                  <a
                    href={row.audioSubmissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    View submission
                  </a>
                );
              }
              return (
                <audio
                  controls
                  src={`/api/audio-proxy?url=${encodeURIComponent(row.audioSubmissionUrl)}`}
                  className="h-8 max-w-56"
                />
              );
            },
          } satisfies TableColumn<Attendee>,
        ]
      : []),
    // Organizer-defined judging rubric — a running Total plus a button that
    // opens a scoring modal for every criterion at once (inline columns
    // don't scale once a rubric has more than 2-3 criteria). Rounds with no
    // rubric configured skip straight to the plain Shortlist/Reject
    // decision below.
    ...(activeRound?.rubric.length
      ? [
          {
            key: "total",
            // Organizer sees the blended cross-judge total (their
            // legitimate oversight view). A judge sees only their own
            // total — the blended figure would leak how everyone else
            // scored before rank/shortlisting is even resolved, which is
            // exactly what a judge shouldn't see.
            header: viewerRole === "organizer" ? "Total" : "Your Total",
            render: (row: Attendee) => {
              const value =
                viewerRole === "organizer"
                  ? totalRubricScore(activeRound.rubric, scores, row.id, activeRoundId)
                  : Object.values(
                      session
                        ? myRoundScores(scores, row.id, activeRoundId, session.userId)
                        : {},
                    ).reduce((sum, v) => sum + v, 0);
              return (
                <span className="text-text-primary font-medium">
                  {value}
                  {" / "}
                  {activeRound.rubric.reduce((sum, c) => sum + c.maxScore, 0)}
                </span>
              );
            },
          } satisfies TableColumn<Attendee>,
          // Rank is organizer-only — a judge shouldn't see where their own
          // scoring lands everyone else, only their own input.
          ...(viewerRole === "organizer"
            ? [
                {
                  key: "rank",
                  header: "Rank",
                  render: (row: Attendee) => (
                    <span className="text-text-secondary">
                      {rankByParticipant[row.id] ?? "—"}
                    </span>
                  ),
                } satisfies TableColumn<Attendee>,
              ]
            : []),
          {
            key: "score",
            header: "",
            render: (row: Attendee) => (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setScoringParticipantId(row.id)}
              >
                {canScoreActiveRound ? "Score" : "View Scores"}
              </Button>
            ),
          } satisfies TableColumn<Attendee>,
        ]
      : []),
    // Round decision status is organizer-only — a judge doesn't need to see
    // (or be swayed by) whether someone's already been Shortlisted/Rejected.
    ...(viewerRole === "organizer"
      ? [
          {
            key: "status",
            header: "Round Status",
            render: (row: Attendee) => {
              const status = currentRoundStatus(decisions, row.id, activeRoundId);
              if (!status) {
                return <span className="text-text-secondary">Not decided</span>;
              }
              return (
                <Badge variant="muted" tone={roundDecisionTone[status]} size="sm">
                  {roundDecisionLabel[status]}
                </Badge>
              );
            },
          } satisfies TableColumn<Attendee>,
        ]
      : []),
    ...(autoModeActive
      ? []
      : [
          {
            key: "actions",
            header: "",
            render: (row: Attendee) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deciding}
                  onClick={() => decideOne(row.id, "SHORTLISTED")}
                >
                  Shortlist
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deciding}
                  onClick={() => decideOne(row.id, "REJECTED")}
                >
                  Reject
                </Button>
              </div>
            ),
          } satisfies TableColumn<Attendee>,
        ]),
  ];

  if (event.rounds.length === 0) {
    return (
      <p className="text-body text-text-secondary p-6 text-center">
        No rounds configured yet — add them from the event&apos;s edit wizard.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {!onlyRoundId && (
        <Tabs
          items={event.rounds.map((round, index) => {
            const locked =
              index > 0 &&
              !isRoundDecided(
                participantIds,
                decisions,
                event.rounds[index - 1].id,
              );
            return {
              value: round.id,
              label: locked ? `${round.name} (Locked)` : round.name,
            };
          })}
          value={activeRoundId}
          onChange={(value) => {
            setInternalActiveRoundId(value);
            setSelectedIds(new Set());
          }}
        />
      )}

      {error && <Banner tone="danger">{error}</Banner>}

      {isActiveRoundLocked ? (
        <Banner tone="info">
          Complete &quot;{previousRound?.name}&quot; first — every
          participant needs a Shortlist/Reject decision there before this
          round unlocks.
        </Banner>
      ) : (
        <>
          {autoModeActive ? (
            <Banner tone="info">
              Decisions for this round are automatic — once every
              participant is scored on every criterion, the top{" "}
              {activeRound?.shortlistCount} by total score are Shortlisted
              and the rest Rejected.
            </Banner>
          ) : (
            <BulkActionBar
              selectedCount={selectedIds.size}
              onClear={() => setSelectedIds(new Set())}
              actions={[
                {
                  label: "Shortlist Selected",
                  onClick: () => decideSelected("SHORTLISTED"),
                },
                {
                  label: "Reject Selected",
                  onClick: () => decideSelected("REJECTED"),
                  variant: "ghost",
                },
              ]}
            />
          )}

          <Table
            columns={columns}
            rows={participants}
            rowKey={(row) => row.id}
            selectable={!autoModeActive}
            selectedKeys={selectedIds}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            emptyState={
              <p className="text-body text-text-secondary p-6 text-center">
                No Participant-category registrations yet.
              </p>
            }
          />
        </>
      )}

      <Modal
        open={!!scoringParticipant}
        onClose={() => setScoringParticipantId(null)}
        title={
          scoringParticipant
            ? `${canScoreActiveRound ? "Score" : "Scores"} — ${scoringParticipant.name}`
            : "Score"
        }
        footer={
          canScoreActiveRound && scoringParticipant ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                disabled={submittingScores}
                onClick={() => setScoringParticipantId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={submittingScores}
                onClick={() => submitScores(scoringParticipant.id)}
              >
                {submittingScores ? "Submitting…" : "Submit"}
              </Button>
            </>
          ) : undefined
        }
      >
        {activeRound && scoringParticipant && !canScoreActiveRound && viewerRole === "panelist" && (
          // Defensive fallback — the judge/[id] page never actually routes
          // a panelist to RoundsTab for an Offline round (that's live-judged
          // via the Live Judging tab instead), but if it ever did, a judge
          // must not see the cross-judge breakdown below either way.
          <p className="text-body text-text-secondary">
            This round is judged live — see the Live Judging tab.
          </p>
        )}
        {activeRound && scoringParticipant && !canScoreActiveRound && viewerRole === "organizer" && (
          <div className="space-y-4">
            {activeRound.rubric.length === 0 ? (
              <p className="text-body text-text-secondary">
                This round has no scoring rubric.
              </p>
            ) : (
              <>
                {(() => {
                  const blended = currentRoundScores(
                    scores,
                    scoringParticipant.id,
                    activeRoundId,
                  );
                  return activeRound.rubric.map((criterion) => (
                    <div
                      key={criterion.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-body text-text-secondary">
                        {criterion.label}
                      </span>
                      <span className="text-body text-text-primary font-medium">
                        {blended[criterion.id] !== undefined
                          ? blended[criterion.id]
                          : "—"}{" "}
                        / {criterion.maxScore}
                      </span>
                    </div>
                  ));
                })()}
                <p className="text-body text-text-primary border-border-light border-t pt-3 font-medium">
                  Total:{" "}
                  {totalRubricScore(
                    activeRound.rubric,
                    scores,
                    scoringParticipant.id,
                    activeRoundId,
                  )}{" "}
                  / {activeRound.rubric.reduce((sum, c) => sum + c.maxScore, 0)}
                  {" · "}Rank{" "}
                  {roundFullyScored
                    ? rankByParticipant[scoringParticipant.id]
                    : "pending — not every panelist has judged yet"}
                </p>
                <div className="border-border-light space-y-2 border-t pt-3">
                  <p className="text-small text-text-secondary font-medium">
                    Scored by
                  </p>
                  {panelists.length === 0 && (
                    <p className="text-small text-text-secondary">
                      No accepted panelists yet.
                    </p>
                  )}
                  {panelists.map((panelist) => {
                    const mine = panelist.userId
                      ? scoresByJudge(
                          scores,
                          scoringParticipant.id,
                          activeRoundId,
                        )[panelist.userId]
                      : undefined;
                    return (
                      <div key={panelist.id} className="space-y-1">
                        <p className="text-small text-text-secondary">
                          {panelist.invitedEmail}
                        </p>
                        {mine ? (
                          <div className="space-y-0.5 pl-2">
                            {activeRound.rubric.map((criterion) => (
                              <div
                                key={criterion.id}
                                className="flex items-center justify-between text-small"
                              >
                                <span className="text-text-secondary">
                                  {criterion.label}
                                </span>
                                <span className="text-text-primary">
                                  {mine[criterion.id] ?? "—"} /{" "}
                                  {criterion.maxScore}
                                </span>
                              </div>
                            ))}
                            <div className="border-border-light flex items-center justify-between border-t pt-1 text-small font-medium">
                              <span className="text-text-secondary">Total</span>
                              <span className="text-text-primary">
                                {Object.values(mine).reduce((sum, v) => sum + v, 0)}{" "}
                                /{" "}
                                {activeRound.rubric.reduce(
                                  (sum, c) => sum + c.maxScore,
                                  0,
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-small text-text-secondary pl-2">
                            Not yet scored
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
        {activeRound && scoringParticipant && canScoreActiveRound && (
          <div className="space-y-4">
            {activeRound.rubric.map((criterion) => {
              const draftKey = `${scoringParticipant.id}:${criterion.id}`;
              // The judge's own prior entry, not the blended average other
              // judges' scores produce — see myRoundScores' own comment for
              // why showing the average here would be actively wrong.
              const current = session
                ? myRoundScores(
                    scores,
                    scoringParticipant.id,
                    activeRoundId,
                    session.userId,
                  )[criterion.id]
                : undefined;
              const value =
                scoreDrafts[draftKey] ??
                (current !== undefined ? String(current) : "");
              return (
                <FormField
                  key={criterion.id}
                  label={`${criterion.label} (out of ${criterion.maxScore})`}
                  htmlFor={`modal-score-${criterion.id}`}
                >
                  <Input
                    id={`modal-score-${criterion.id}`}
                    type="number"
                    min={0}
                    max={criterion.maxScore}
                    step={0.1}
                    value={value}
                    onChange={(event) =>
                      setScoreDrafts((prev) => ({
                        ...prev,
                        [draftKey]: event.target.value,
                      }))
                    }
                  />
                </FormField>
              );
            })}
            <p className="text-body text-text-primary border-border-light border-t pt-3 font-medium">
              Your Total:{" "}
              {Object.values(
                session
                  ? myRoundScores(scores, scoringParticipant.id, activeRoundId, session.userId)
                  : {},
              ).reduce((sum, v) => sum + v, 0)}{" "}
              / {activeRound.rubric.reduce((sum, c) => sum + c.maxScore, 0)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

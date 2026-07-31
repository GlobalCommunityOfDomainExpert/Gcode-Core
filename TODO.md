# Event Judging Flow — Build Status

Tracked against `GCODE EVENTS.md` (full judging flow spec: organizer, panelist,
participant, audience, admin). Snapshot as of 2026-07-30.

## Done

- [x] Create Event (wizard)
- [x] Configure Rounds — name, description, mode (Online/Offline), date/times
- [x] Configure Scoring Rubric — per-round criteria (label + max score),
      wizard editor, organizer scores each participant per criterion in the
      Rounds tab, persists (`GCODE_EVENT_ROUND_RUBRICS` /
      `GCODE_EVENT_ROUND_SCORES`)
- [x] Shortlist/Reject decision per round (`GCODE_EVENT_ROUND_DECISIONS`) —
      not in the spec doc's diagrams explicitly but covers "Shortlist
      Participants"
- [x] Auto-shortlist top N per round, once every participant is scored —
      configurable per round, auto-fires `decideRoundStatus` for
      Shortlist/Reject, hides manual actions once enabled
- [x] Round locking — a round stays locked until every participant has a
      decision in the round before it
- [x] Scoring UI as a modal (one participant, every criterion at once)
      instead of one inline table column per criterion
- [x] Live mode gated to Offline-mode rounds only; candidate pool scoped to
      participants Shortlisted from the round before it
- [x] `GCODE_EVENT_RATINGS`/`GCODE_EVENT_LIVE_STATE` now carry `round_id` —
      live ratings are attributable to a specific round
- [x] Panelist onboarding (Phase 1 of STRATEGY.md) — invite by email
      (no role restriction, any account type), accept/decline via
      `/panelist-invites/[id]`, organizer-facing Panelists tab
      (invite/list/remove).
- [x] Panelist judging access — `/judge/[id]`, gated to accepted panelists
      only (`usePanelistAccess` hook), reuses `RoundsTab` as-is. No
      round-level assignment yet — any accepted panelist for the event can
      score any of its rounds, not scoped to a specific round
      (`GCODE_EVENT_ROUND_PANELISTS` from STRATEGY.md Phase 2 not built).
- [x] Multi-judge score averaging (Phase 4) — `currentRoundScores()`
      averages every judge's latest score per criterion instead of one
      judge's submission silently overwriting another's. Each judge's own
      score modal shows/edits *their own* prior entry (`myRoundScores()`),
      not the blended average.
- [x] Auto-shortlist waits for every accepted panelist to have scored, not
      just "someone" — `isRoundFullyScored` now takes the event's accepted
      panelist ids and requires all of them per criterion (falls back to
      "any one score counts" when no panelists are assigned, so
      single-scorer events behave exactly as before).
- [x] In-Person Live Judging, merged into one view — "Offline" is now
      synonymous with "live-judged": every Offline round uses the
      current-performer mechanic, not just the last one.
      `resolveActiveRound`/`resolveLiveRound` (`src/lib/rounds.ts`) pick
      whichever round is the current lock-chain frontier, not a fixed "last
      Offline round" assumption. Panelists score the current performer
      inline via a new Live Judging tab (`/judge/[id]`, current-round-scoped,
      no browsing other rounds); organizer's Live tab shows Judge Score /
      Audience Score / blended Final Score for whoever's on stage, a
      per-panelist score breakdown, and a live leaderboard across everyone
      who's performed. Tested end-to-end against real WKSP_GCODE2 with
      throwaway accounts.
- [x] Judge Weight / Audience Weight config — per-round `judgeWeight`/
      `audienceWeight` fields (default 70/30), editable in the wizard for
      Offline rounds, backed by `GCODE_EVENT_ROUNDS.JUDGE_WEIGHT`/
      `AUDIENCE_WEIGHT` (both round-trip correctly — write via
      `replace_rounds`, read via the `/rounds` Collection Query, both
      confirmed live).
- [x] Live Result Calculation — blended Final Score
      (`blendedFinalScore` in `src/lib/rounds.ts`): both sources present ->
      weighted average; either source missing (Casual mode has no numeric
      audience score, or nobody's judged yet) -> falls back to whichever
      exists, not a false partial blend. Live rank shown in the leaderboard
      above, computed client-side from round-scoped scores + audience
      ratings (`GET /events/:id/round-ratings`, now live).
- [x] Admin/organizer never scores — panelist-only scoring everywhere
      (Online rounds via `RoundsTab`, Offline via Live Judging). Organizer's
      view is read-only: total, rank (gated — stays "pending" until every
      accepted panelist has scored, not a misleading partial rank), and a
      "scored by" breakdown showing each panelist's own per-criterion
      scores, not just a blended total.

## Partial

- [ ] Online Review — Rounds tab shows the audio submission for Online-mode
      rounds so the organizer can review, but scoring is panelist-only now
      (see Done) and there's still no per-panelist assignment/queue. One
      shared view, not "each panelist gets their assigned submissions."
- [ ] Audience Voting — exists as live 0–100 rating / reactions
      (`GCODE_EVENT_RATINGS`), not a discrete "vote," but same idea
      functionally.

## Not started

- [ ] Assign Panelists to specific rounds (STRATEGY.md Phase 2's remaining
      slice) — invite/accept + judging access both exist (see Done), but
      every accepted panelist can score every round; nothing scopes a
      panelist to just the round(s) they were assigned.
- [ ] Round Completion flow — freeze scores, generate leaderboard, publish
      results. `certificate` is just a boolean flag on the event today, not
      tied to round completion.
- [ ] Scoring Status state machine (Not Started → In Progress → Waiting for
      Other Judges → Waiting for Audience → Completed → Locked → Published).
      Scores are currently plain append-only rows with no status/lock.
- [ ] Admin Unlock Score override — nothing to unlock, no lock exists yet.
- [ ] Export Scores (Excel/PDF).
- [ ] Everything under the spec's "Recommended Future Features" section
      (multiple rubrics, COI declaration, anonymous judging, AI scoring
      suggestions, tie-breakers, QR/SMS/app voting, live leaderboard
      projection, score normalization, audit log) — explicitly future work,
      not started.

## Notes

- Backend for rounds/rubric/scores is contract-first against WKSP_GCODE2 —
  see `GCODE_ROUNDS_API` package and the ORDS handlers under
  `gcode.events.v1` (`:id/rounds`, `:id/round-scores`) and
  `gcode.participants.v1` (`:id/round-score`).
- `GET /events/:id/rounds` is a raw SQL Collection Query, not routed through
  `GCODE_ROUNDS_API.list_rounds` — its `rubric` column comes back as a
  JSON-encoded **string**, not a nested array; `adaptEventRound` in
  `src/lib/api/adapters.ts` parses it defensively. Don't assume the array
  shape holds if this handler's SQL changes. Now also selects
  `NVL(judge_weight,70)`/`NVL(audience_weight,30)` (added 2026-07-30,
  confirmed live) — any future edit to this handler's SQL needs to keep
  those two columns too, since they don't come from the package function.
- Live judging backend (2026-07-30): `GCODE_EVENT_ROUNDS.JUDGE_WEIGHT`/
  `AUDIENCE_WEIGHT` columns, `GCODE_ROUNDS_API.replace_rounds`/`list_rounds`
  patched, new `GCODE_RATINGS_API.list_round_ratings` +
  `GET /events/:id/round-ratings` ORDS handler — all applied and confirmed
  live. See `rounds_backend_status` memory for exact package body diffs if
  this needs revisiting.
- **`GCODE_USERS.USER_ID` can be a 30-40 digit number** — confirmed live
  (`116712435545336184399804426316856048372`), well past JS's ~15-17
  safe-integer digits. Any ORDS handler that emits a `USER_ID`/similar
  NUMBER column as a bare JSON number gets silently corrupted by the
  browser's `JSON.parse` (rounds to the nearest double — e.g. that value
  becomes `1.167124355453362e+38`), breaking any client-side comparison
  against the JWT's exact-string `userId`. Fixed for
  `list_panelists` (`TO_CHAR(USER_ID)`) — check any *other* handler that
  outputs a raw user id column the same way before relying on it
  client-side.

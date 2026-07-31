# Implementation Strategy — Event Judging Flow

Companion to `TODO.md`. Phased plan for the "Not started"/"Partial" items,
grounded in this codebase's existing conventions rather than a green-field
design. Each phase lists: what already exists to build on, what's new, and
rough size (S/M/L).

General conventions this plan reuses throughout (already established
elsewhere in the repo — don't invent new patterns where these fit):

- **Contract-first backend**: new tables/packages get built and applied by
  the user directly in WKSP_GCODE2 (SQL Workshop), this session only has
  read access to table structure + package specs, never bodies. Frontend API
  calls for anything not yet backed degrade to `[]`/no-op rather than throw
  (`src/lib/api/rounds.ts` is the reference — `listEventRounds`,
  `replaceEventRounds`).
- **Full-replace child collections**: `GCODE_EVENT_ROUNDS`,
  `GCODE_EVENT_ROUND_RUBRICS`, timeline, social links, media — organizer
  edits the whole set in the wizard, save does delete-all-then-reinsert via
  one `POST`. New "organizer configures a list of X" features should follow
  this, not per-row CRUD endpoints.
- **Append-only history + latest-wins reduction**: `GCODE_EVENT_ROUND_DECISIONS`,
  `GCODE_EVENT_ROUND_SCORES`. Client reduces to "latest" via
  `currentRoundStatus`/`currentRoundScores` in `src/lib/rounds.ts`. Cheap to
  extend (new column, same reduction shape) — no schema migrations needed to
  add fields to the *meaning* of a row.
- **Session-scoped access, not fine RBAC**: only two access tiers exist —
  `isAdmin(session)` (JWT `role` claim) gates `/my-organized-events/*`
  entirely (`src/app/(app)/(events)/layout.tsx`), everything else is either
  public or "any signed-in user." There is no third role today.
- **Wizard step pattern**: `EventWizard` (`event-wizard.tsx`) renders one
  `Step*` component per `stepIndex`, all writing into one `EventDetailData`
  object via `update()`. New organizer-facing config lives here as a new
  step, not a separate settings page.
- **Tab pattern on the event detail page**: `my-organized-events/[id]/page.tsx`
  conditionally adds tabs (`showRoundsTab` etc.) and renders a `*Tab`
  component per tab. New judging UI (leaderboard, panelist management)
  should be a new conditional tab here, matching `RoundsTab`/`LiveTab`.
- **SSE-via-polling for "live"**: `src/app/api/events/[id]/live-performer/stream/route.ts`
  is the only live-push mechanism in the app — server-side polls ORDS every
  2s, pushes to browser on change. Reuse this exact shape for anything else
  that needs to feel live (final-score ticker, leaderboard).
- **Email invites**: `GCODE_EMAIL_API` + `wrap_layout()` shared template
  function, confirmed real (`APEX_MAIL.SEND`) — see memory
  `apex_mail_send_pattern`. Panelist invite emails reuse this, not a new
  mail mechanism.

---

## Phase 1 — Panelist as an event-scoped assignment, not a new global role

**Why this shape:** adding a true third JWT role (`PANELIST` alongside
`ADMIN`/`NONE`) means backend `AUTH_PKG` token-issuance changes — out of
this app's reach without backend team involvement, and overkill. Model a
panelist instead as *any signed-in user assigned to a specific event*,
checked via a junction table, the same way `GCODE_EVENT_CATEGORY_MAP` scopes
categories to events without needing a new role.

**New DB:**
- `GCODE_EVENT_PANELISTS` — `id, event_id, user_id, invited_email, status
  ('INVITED'|'ACCEPTED'|'DECLINED'), invited_on, responded_on`. FK
  `event_id -> EVENTS.id`; `user_id` nullable until the invitee has/creates
  an account (mirrors `GCODE_PENDING_USERS`' "invited before they exist"
  shape from `auth_pkg_real_signatures`).
- `GCODE_EVENT_ROUND_PANELISTS` — `id, round_id, panelist_id`. Assigns an
  *accepted* panelist to specific round(s) — this is Phase 2, but the table
  can be created alongside Phase 1 since it's additive.
- New `GCODE_ROUNDS_API` (or a new `GCODE_PANELISTS_API`) procs:
  `invite_panelist(p_event_id, p_email, p_invited_by)`,
  `respond_to_invite(p_panelist_id, p_status)`,
  `list_panelists(p_event_id)`.

**New ORDS**, same module conventions as existing round endpoints:
- `POST /events/{id}/panelists` — invite (full-replace is wrong here, this
  is additive not a config list — one row per invite action).
- `PUT /panelists/{id}/respond` — accept/decline.
- `GET /events/{id}/panelists` — list, degrade-to-`[]`.

**Frontend:**
- `src/lib/event.ts`: new `EventPanelist` interface.
- `src/lib/api/panelists.ts`: new file, mirrors `rounds.ts` shape
  (`invitePanelist`, `respondToPanelistInvite`, `listEventPanelists`, all
  degrade-safe).
- New organizer tab `PanelistsTab` (`my-organized-events/[id]/_components/`)
  — invite form + status list, same shape as `AttendeesTab`'s table.
- Invite acceptance flow: reuse the existing sign-up flow's "OAuth-style
  deep link" pattern already in `sign-up-flow.tsx` (`?oauth=1&userId=...`) —
  an invite email links to `/sign-up?panelistInvite=<id>` or, if the
  invitee already has an account, straight to a
  `/panelist-invites/<id>/respond` page gated on "signed in."

**Size: M.** No changes to existing rounds/rubric/score code — purely
additive.

---

## Phase 2 — Assign panelists to rounds

Builds directly on `GCODE_EVENT_ROUND_PANELISTS` from Phase 1.

**Frontend:**
- Extend `step-rounds.tsx`'s round card with a panelist multi-select
  (reuse the `ToggleGroup`/checkbox pattern already used for mode), backed
  by the event's accepted panelist list (fetched once, same `useLookup`
  pattern as `getEventTypes`/`getModes`).
- `RoundsTab` gains a filter: when the signed-in user is a panelist (not
  ADMIN) on this round, show only their assigned scope. This is the first
  place the app needs "am I a panelist here" — add a small hook
  `usePanelistAccess(eventId)` mirroring `useSession`.

**Access control change:** `EventsAppLayout`'s `isAdmin`-only gate on
`/my-organized-events/*` needs a carve-out — a panelist isn't an ADMIN but
needs to reach the Rounds tab of one specific event. Cleanest fix: give
panelists a *separate* route (`/judge/[eventId]`) rather than reusing the
ADMIN-gated organizer section at all — avoids touching the existing gate's
security semantics. New route, new minimal layout, reuses `RoundsTab`
scoring UI as a component.

**Size: M.** Mostly UI plumbing once Phase 1's data model exists.

---

## Phase 3 — Independent scoring toggles + weighted total

**Revised design (2026-07-29), replaces the original single-weight sketch:**
there are two independent scoring *sources* — panelist rubric scoring
(already built) and audience scoring (the Competitive-mode live rating,
already built) — and they combine into one weighted total when both are on.
Today `rating_mode` is a single Competitive/Casual switch; that's not
expressive enough. The real model is three independent controls:

1. **Panelist scoring enabled/disabled** — some events skip judges
   entirely, pure audience-decided. New `EVENTS.PANELIST_SCORING_ENABLED`
   (`NUMBER(1) DEFAULT 1`, same convention as `certificate_offered`).
2. **Audience (competitive) scoring enabled/disabled** — new
   `EVENTS.AUDIENCE_SCORING_ENABLED` (`NUMBER(1) DEFAULT 0`). This is
   *distinct* from Casual mode below — it's "does the 0–100 numeric rating
   count toward a total," not "is Casual mode active right now."
3. **Casual mode** — reactions only, no numeric score. Stays exactly what
   `rating_mode = 'CASUAL'` already is, and stays independently toggleable
   by the organizer at any time (`live-tab.tsx`'s existing `ToggleGroup`) —
   flipping to Casual doesn't change the two enabled-flags above, it just
   means no numeric audience score is being collected *right now*. When the
   organizer flips back to Competitive, audience scoring resumes if flag #2
   is on.

**Weight columns**, only meaningful when *both* #1 and #2 are enabled —
`EVENTS.JUDGE_WEIGHT NUMBER DEFAULT 70`, `EVENTS.AUDIENCE_WEIGHT NUMBER
DEFAULT 30` (percentages, enforce sum=100 client-side, not a DB
constraint — matches how loosely other percentages are handled here).
When only one of #1/#2 is enabled, total score = that source alone, no
weighting math needed (weights become irrelevant, not just defaulted).

**Frontend:**
- `src/lib/zod/event.ts`: add `panelistScoringEnabled` (default `true`),
  `audienceScoringEnabled` (default `false`), `judgeWeight`/`audienceWeight`
  (defaults 70/30) to `eventDetailDataSchema`.
- New pair of switches in `step-registration.tsx` or a new small section in
  `live-tab.tsx` (same `Switch` atom already used for Attendee/Participant
  pass toggles) — "Enable panelist scoring" / "Enable audience scoring."
  Weight inputs only render when both are on.
- `live-tab.tsx`'s existing Casual/Competitive `ToggleGroup` stays as-is,
  just becomes conditionally rendered/disabled when audience scoring is
  off entirely (no point picking Casual vs Competitive if audience scoring
  isn't part of this event's total at all — though Casual's reactions-only
  fun-factor could arguably still be allowed even then; worth a product call
  when this is actually built, not decided here).
- `adapters.ts`: extend `toCreatePayload`/`adaptApiEvent`, mirrors how
  `rating_mode` already round-trips.

**Size: S–M.** Three columns instead of two, plus the conditional-rendering
logic for "which controls even make sense given the other toggles."

---

## Phase 4 — Rework score model for multiple judges

**The real gap:** `GCODE_EVENT_ROUND_SCORES` + `currentRoundScores()`
today collapse to "latest row wins" per `(participant, criterion)` —
correct for "one organizer scores everyone" (today's reality), wrong for
"5 judges each submit their own score, average them" (the spec's actual
model, see "Live Result Calculation": `Judge 1..5 → Average Judge Score`).

**Change:** `scored_by` already exists as a free-text column (currently
holds `session.userId`) — the averaging fix is entirely in the *reduction*
logic, not the schema:
- `src/lib/rounds.ts`: `currentRoundScores()` currently returns "latest
  score per criterion." Change to "latest score **per (criterion,
  scored_by)**, averaged across distinct `scored_by` values" — small,
  contained change, same file, same function signature at the call sites
  (`totalRubricScore`, `RoundsTab`'s score cells) since it still returns
  `Record<criterionId, number>`.
- `RoundsTab`: currently one score input per criterion per participant.
  Once multiple judges exist (Phase 1/2), each judge only sees/edits *their
  own* score cell, not an aggregate — the aggregate (average) only shows to
  the organizer/on the leaderboard. This needs the `usePanelistAccess`
  scoping from Phase 2 to know "am I scoring as myself, or viewing the
  rollup."

**Size: S–M.** Small logic change, but sequenced after Phase 1/2 since it's
meaningless without multiple real judges to average.

---

## Phase 5 — Live Result Calculation (blended final score + rank)

**Depends on:** Phase 3 (toggles + weights) + Phase 4 (judge average) +
existing `GCODE_EVENT_RATINGS` (audience score, already live).

**Prerequisite gap found 2026-07-29, fix here:** `GCODE_EVENT_RATINGS` has
no `round_id` column — only `event_id`/`rater_attendee_id`/
`performer_participant_id`. The Live tab is now scoped to "the" Offline
round (see `live-tab.tsx`'s `liveRound`), but the rating rows themselves
don't know which round they belong to. Fine while an event has at most one
live-judged round; breaks the moment one has two (ratings from both would
mix in storage with no way to separate them). Add `ROUND_ID NUMBER NULL`
(nullable — existing rows predate this) to `GCODE_EVENT_RATINGS`, thread it
through `set_current_performer`/`submit_rating`/`get_live_state` and the
`GET .../live-performer` / `POST .../rating` ORDS handlers, and have
`live-tab.tsx` pass `liveRound.id` when calling `setLivePerformer`.

**Total score depends on which of Phase 3's toggles are on** — not always
a blend:
- Only panelist scoring enabled → total = judge score alone (today's
  behavior via `totalRubricScore`, nothing new needed).
- Only audience scoring enabled → total = audience average alone.
- Both enabled → `judge_weight × judge_score + audience_weight ×
  audience_score`.
- Neither enabled (organizer left Casual mode as pure engagement, no
  judges) → no "total score" concept applies at all; leaderboard (Phase 6)
  wouldn't exist for that event's Offline round.

**New DB:** the `round_id` column above, plus optionally a
`GCODE_RATINGS_API.get_live_final_score(p_event_id, p_round_id,
p_participant_id)` function returning `{judge_score, audience_score,
final_score}` computed server-side per the branching above (matches how
`get_live_state` already returns `avg_rating` computed server-side, per
`live_rating_feature` memory) — cleaner than duplicating the branching
weighted-average logic in the frontend.

**Frontend:**
- `scoreboard/page.tsx` already polls live state via SSE and displays
  `avg_rating`. Extend the SSE payload (or add a second poll, same
  `/api/events/[id]/live-performer/stream` proxy pattern) to include
  `judge_score`/`final_score` (whichever branch above applies), render the
  blended `Final Score` card — the spec's "Live Screen" mockup (Judge Score
  / Audience Score / Final Score / Current Rank), each section only shown
  when that source is actually enabled for the event.
- "Current Rank" needs a same-round leaderboard query
  (`ORDER BY final_score DESC`) — new endpoint, or compute client-side from
  `list_round_scores` + `GCODE_EVENT_RATINGS` (now filterable by
  `round_id`) if participant counts stay small (this app has no pagination
  pressure anywhere yet, small-scale assumption holds).

**Size: M.** Mostly server-side computation + wiring into an existing live
display, not new UI paradigms. The `round_id` backfill is a small additive
migration, not a breaking one (nullable column, old rows just read as
"round-less").

---

## Phase 6 — Round completion, leaderboard, publish, certificates

**New DB:** `GCODE_EVENT_ROUNDS` gains a `STATUS` column
(`'OPEN'|'FROZEN'|'PUBLISHED'`, mirrors `EVENT_STATUS`'s lookup-table
convention — could be a real lookup table `ROUND_STATUS` rather than a
free-text column, matching how `EVENTS.status_id` works, for consistency).

**New ORDS:** `PUT /rounds/{id}/status` (freeze/publish transitions,
organizer-only). `GET /rounds/{id}/leaderboard` — ranked list of
participants by final score for that round, only populated once
`status != 'OPEN'` (freezing = no more score writes accepted server-side,
enforce in the PL/SQL not just the UI).

**Frontend:**
- `RoundsTab` gains a "Freeze & Publish" organizer action (button next to
  the existing Shortlist/Reject bulk actions) — once frozen, score inputs
  become read-only (`disabled` prop already exists on `Input`).
- New `LeaderboardTab` or a leaderboard section inside `RoundsTab` once a
  round is published — reuse the `Table` molecule, same as every other
  tabular view in this codebase.
- Certificates: `certificate` boolean already exists on `EventDetailData`
  (currently "no backend column yet" per its own comment in
  `zod/event.ts`) — tying it to round completion means: on round
  publish, if `event.certificate`, trigger a certificate-generation flow.
  This is its own sub-project (PDF generation, storage) — treat as a
  separate phase, not bundled here; TODO.md should keep it as its own line
  item once this phase starts.

**Size: L.** Real new state machine + a new generated-document pipeline if
certificates are included; leaderboard alone is M.

---

## Phase 7 — Scoring status states + locking + admin override

**Reframe from the spec:** the 7-state machine (Not Started → ... →
Published) is mostly *derivable*, not stored, given what Phase 6 already
adds:
- `Not Started` — no score rows exist for this participant/round.
- `In Progress` — some but not all assigned panelists have scored.
- `Waiting for Other Judges` — this judge scored, others haven't (needs
  Phase 1's panelist-assignment count to know "how many judges are
  expected").
- `Waiting for Audience Voting` — Competitive mode, round frozen, no
  audience ratings yet for this performer.
- `Completed` — all judges + audience (if applicable) have scored.
- `Locked` — round `STATUS = 'FROZEN'` (Phase 6).
- `Published` — round `STATUS = 'PUBLISHED'` (Phase 6).

Only "Locked" needs real enforcement (reject score writes server-side once
frozen) — the rest can be a pure client-side computed badge, avoiding a new
column/migration entirely. Compute in `src/lib/rounds.ts` alongside the
existing `currentRoundScores`/`totalRubricScore` helpers.

**Admin unlock override:** `PUT /rounds/{id}/status` (Phase 6) with
`status='OPEN'` again, gated to ADMIN only (already have `isAdmin()`) —
no new mechanism needed beyond what Phase 6 built, just don't restrict the
unfreeze direction to "organizer of this event only" the way freeze
probably should be.

**Size: S**, once Phase 6 exists. Mostly derived state, not new storage.

---

## Phase 8 — Export scores

**Straightforward, no dependencies beyond current data existing.** CSV
export of `list_round_scores` + `list_round_decisions` joined with
participant names — client-side CSV generation (no library currently in
`package.json` does this; smallest addition is a plain string-join CSV
builder, matching this codebase's general preference for hand-rolled
utilities over new dependencies — see `src/lib/rounds.ts`'s own
reduction helpers as precedent). PDF export, if wanted, is a much bigger
addition (no PDF library in the repo either) — recommend shipping CSV
first, treat PDF as a stretch goal.

**Size: S** (CSV) **/ M** (PDF, separate effort).

---

## Suggested build order

1. `GCODE_EVENT_RATINGS.ROUND_ID` backfill (now folded into Phase 5) —
   worth doing on its own first, actually: small, nullable, additive, and
   fixes a real live gap (Live tab is already round-scoped on the frontend,
   storage isn't) independent of everything else below.
2. Phase 3 (toggles + weights) — cheap, no dependencies, but now slightly
   more than "trivial" per the revised three-toggle design.
3. Phase 1 → Phase 2 (panelists + round assignment) — the actual
   foundational gap; almost everything else assumes multiple judges exist.
4. Phase 4 (multi-judge averaging) — small once Phase 1/2 land.
5. Phase 5 (live final score + rank, the toggle-aware branching) — the
   visible payoff, do this once real judge data exists to blend.
6. Phase 6 (round completion/leaderboard/publish) — bundle certificates as
   its own sub-phase if/when reached.
7. Phase 7 (status states + lock) — cheap, do right after Phase 6.
8. Phase 8 (export) — any time, no dependencies, good filler between
   phases.

Each phase should get its own DDL/PL-SQL script handed to the user the same
way `round-rubric-backend.sql` was for the rubric feature — this session
still can't write DB objects directly (`db_schema_wksp_gcode2` memory:
DDL-only restriction), and can't read package bodies, so every phase's
backend half stays a collaborative "I draft, you apply, I verify against
the live ORDS response" loop like the one that shipped Phase 0 (rounds +
rubric) this session.

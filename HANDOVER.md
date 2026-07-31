# Handover — Event Judging Flow

Snapshot as of 2026-07-30. Read this first, then `TODO.md` (what's done/
partial/not-started) and `STRATEGY.md` (phased plan + implementation
details for what's not built yet).

## State of the working tree

**Nothing in this session's work is committed.** `git status` shows a large
uncommitted diff across ~15 files plus several new files (`TODO.md`,
`STRATEGY.md`, `panelists-tab.tsx`, `rounds-tab.tsx`, `step-rounds.tsx`,
`use-panelist-access.ts`, `lib/api/panelists.ts`, `lib/api/rounds.ts`,
`lib/rounds.ts`, `judge/`, `panelist-invites/`). All of it is working and
tested live — see below — but if this session ends and a new one starts
cold, the first move should probably be deciding whether/how to commit,
not assuming a clean starting point.

## What's actually live and working right now

Everything below has been tested end-to-end against the real WKSP_GCODE2
backend and the real running app (not just typechecked) — see `TODO.md`'s
"Done" section for the full list, but the headline items:

- Rounds + judging rubric (per-criterion scoring, modal UI, weighted total).
- Auto-shortlist top N once every *expected judge* has scored — not just
  "someone."
- Round locking (sequential — round N needs round N-1 fully decided).
- Multi-judge score averaging — two judges scoring the same participant get
  averaged, not last-write-wins.
- Panelist onboarding: invite by email (any account, no role restriction),
  accept/decline via `/panelist-invites/[id]`, organizer Panelists tab.
- Panelist judging access: `/judge/[id]`, gated to accepted panelists,
  reuses `RoundsTab` as-is.
- Live rating now carries `round_id` (was previously untracked).

## What's next

Per `STRATEGY.md`'s build order, the next unbuilt piece is the remainder of
**Phase 2**: round-level panelist assignment. Right now any accepted
panelist for an event can score *any* round in it — there's no
`GCODE_EVENT_ROUND_PANELISTS` table or UI to scope a panelist to specific
round(s). After that, `STRATEGY.md` has Phase 3 (judge/audience scoring
toggles + weights) and Phase 5 (blended live final score + rank) still
open.

Explicitly **not** wanted, per direct user instruction this session — don't
re-propose these:
- No nav link / landing page for "my judging assignments." Panelists reach
  `/judge/[id]` only via the email invite link's "Go to Judging" button.

## Gotchas worth knowing before touching backend again

- **This session (and any fresh one) has no read access to package
  *bodies* or ORDS handler source** — only table structure and package
  *specs* via `all_source`. Every backend change this session went through
  a "I draft based on the spec I can see → user pastes the real body/
  handler → I give an exact patch" loop. Don't skip straight to a blind
  `CREATE OR REPLACE PACKAGE BODY` for anything that already has a real
  body deployed (`GCODE_EMAIL_API` is the recurring example) — ask for the
  current body first. Brand-new packages this session authored end-to-end
  (`GCODE_PANELISTS_API`) are the exception — full body is safe to give
  directly since there's no prior body to clobber.
- **`GCODE_USERS.USER_ID` can be a 30-40 digit number.** Any ORDS handler
  emitting it as a bare JSON number gets silently corrupted by the
  browser's `JSON.parse` (rounds to a double, e.g.
  `116712435545336184399804426316856048372` → `1.167124355453362e+38`).
  Cast to text (`TO_CHAR`) in the SQL before trusting it client-side. Only
  caught because a real (non-admin, large-id) panelist account was tested
  — small ids like the admin's `82` never trigger it. See
  [[user_id_json_precision_bug]] memory.
- **ORDS handler bugs seen repeatedly this session, in order of frequency:**
  1. Empty Parameters grid — bind variables referenced in the PL/SQL
     source (`:round_id`, `:status`, etc.) not actually declared as
     parameters, even when `:id` from the URI template appears to
     auto-bind fine.
  2. An OUT ref-cursor bound with Data Type ≠ **RESULTSET** (or Source
     Type set to **HTTP HEADER** by accident) — response ends up in a
     response *header* instead of the body, or the collection cursor
     doesn't serialize as `{items:[...]}`.
  3. **Source Type mismatch** — a handler holding a PL/SQL `BEGIN...END`
     block but configured as **Collection Query** (which expects a raw
     SQL `SELECT`) instead of **PL/SQL**. Looks like a parameter problem
     from the error message, isn't.
  4. Method literally missing — e.g. only a GET handler existed on a
     template, so DELETE 405'd. Browsers report a CORS-header-less 405 as
     a generic "Failed to fetch" — always `curl -i` the same URL/method
     directly to see the real status before assuming CORS.
  5. Module Base Path typo/mismatch with the frontend's assumed path
     (`gcode.panelist.v1` module, base path had to be `/v1/panelists/`
     plural to match everything else — the module *name* staying singular
     didn't matter, only the base path did).
- **Testing convention established this session:** use `mail.tm`'s API
  (not mailinator — its public API 500s intermittently under scripted
  polling) to create real throwaway accounts for anything needing a second
  distinct identity (a second judge, an attendee vs a participant, etc.).
  Playwright scripts for this are in the session scratchpad
  (`/tmp/claude-1000/.../scratchpad/test-*.js`) — that directory does not
  persist across sessions, so any future testing needs fresh scripts, not
  a resume of old ones. Always clean up test event/participant/panelist
  rows from WKSP_GCODE2 after a test run (DML works fine from the
  `startup` connection; DDL does not — see `db_schema_wksp_gcode2` memory).
- **`round-rubric-backend.sql`, `panelists-backend.sql`, etc. in the
  scratchpad are also session-scoped and gone next session.** If backend
  work needs picking back up, regenerate the script from the current spec
  state (`all_source` on the package) rather than assuming the old file
  still exists.

## Where to look

- `TODO.md` — full done/partial/not-started checklist against the original
  spec doc (`GCODE EVENTS.md`, pasted into an earlier turn, not saved as a
  file itself — ask the user to re-paste it if the full spec is needed).
- `STRATEGY.md` — phase-by-phase implementation plan for everything not
  yet built, with sizes and dependencies.
- Memory files (in order of relevance to picking this back up):
  `panelist_onboarding_status`, `rounds_backend_status`,
  `user_id_json_precision_bug`, `db_schema_wksp_gcode2`,
  `apex_mail_send_pattern`, `live_rating_feature`.

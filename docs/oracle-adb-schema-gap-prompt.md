# Prompt for Oracle Autonomous Database — GCODE Events schema gaps

## Context

GCODE_Events_API (ORDS on Oracle ADB) currently exposes an `EVENTS` table with these columns (confirmed working, via `/events` and `/events/{id}`):

```
id, event_type_id, event_name, mode_of_event_id, max_attendees,
city, address, status_id, start_date, end_date, ticket_price,
is_featured, cover_image_url, banner_image_url, participation_link,
registration_deadline, description, created_by, created_on,
updated_by, updated_on
```

Plus lookup tables: `event-types` (id, name, description), `statuses` (id, status_code, status_name, description), `modes` (id, mode_name, description), `categories` (id, category_name, description), and an event↔category join returning `category_id, category_name`.

The frontend (Next.js) has a UI-facing `Event` model with fields that have **no backing column anywhere in the API** today. These are currently hardcoded/placeholder in the adapter layer. Requesting schema additions (new columns or tables) for the following:

## Missing tables/columns

1. **Registration/attendee count** — `registeredCount` is hardcoded to `0`. Need either:
   - a `registered_count` column on `EVENTS` (denormalized counter), or
   - a `REGISTRATIONS` table (`event_id`, `user_id`, `registered_on`, `status`) with a count endpoint/aggregate.

2. **Agenda** — `agenda` always `[]`. Need `EVENT_AGENDA_ITEMS` table: `event_id, sort_order, time, title, description`.

3. **Social links** — `socialLinks` never set. Need `EVENT_SOCIAL_LINKS` table: `event_id, platform, url`.

4. **Terms & eligibility** — `terms` always `[]`. Need `EVENT_TERMS` table (`event_id`, `sort_order`, `term_text`) or a single text/CLOB column on `EVENTS`.

5. **Team size** — `teamSize` always `""`. Need a `team_size` (or `min_team_size`/`max_team_size`) column on `EVENTS`, if team-based registration is a real feature.

6. **Certificate offering** — `certificate` always `false`. Need a `certificate_offered` boolean/number column on `EVENTS`.

7. **Duration** — `duration` always `""` even though `end_date` already exists on `EVENTS`. No new column needed — just confirm `end_date` is populated consistently so the frontend can compute duration from `start_date`/`end_date` instead of asking for a new column.

## Confirmed (was "needs confirmation")

- **`status_id` / `EVENT_STATUS` table**: 7 codes — `DRAFT`, `APPROVAL_PENDING`, `OPEN`, `REGISTRATION_CLOSED`, `ONGOING`, `COMPLETED`, `CANCELLED`. Frontend's old `"published" | "cancelled"` assumption was wrong/incomplete — needs updating to match all 7.
- **`mode_of_event_id` / `MODE_OF_EVENTS` table**: `PHYSICAL`, `ONLINE`, `HYBRID` — matches existing frontend `MODE_NAME_MAP` in `adapters.ts`, no change needed.

## Not requesting

- `participation_link` already exists on `EVENTS` — frontend adapter was simply not reading it (now fixed client-side, no DB change needed).
- Event type/category taxonomy is already fully dynamic via the `event-types`/`categories` lookups — no changes needed there.

---

## Other frontend stores — entirely mock, zero backend today

Unlike `organized-events-store` (partially wired to real `/events` API), the stores below are **100% in-memory fixture data** with no API calls at all. These need whole new tables + ORDS endpoints, not just missing columns.

### 1. Attendees (`src/store/attendees-tab-store.ts` + `src/lib/attendees.ts`)

Hardcoded `mockAttendees` array, filtered client-side by `eventId`. Need an `ATTENDEES` (or `REGISTRATIONS`) table:

```
id, event_id, name, email, avatar_initials (or derive from name),
role,            -- e.g. Fresher / Startup Founder / Domain Expert / Institution — confirm if this is a fixed enum or free text
ticket_type,     -- Free / Paid
amount_paid,     -- nullable, only for paid tickets
status,          -- registered / attended / missed / cancelled
registered_at
```
Plus a paginated/filterable list endpoint (`GET /events/{id}/attendees?status=&query=&page=`) to replace the client-side mock filter — this table also directly answers the `registeredCount` gap above.

### 2. Communications (`src/store/communications-store.ts` + `src/lib/communications.ts`)

Hardcoded `seedLogs`, appended to client-side, never persisted. Need a `COMMUNICATION_LOGS` table:

```
id, event_id, subject, message, sent_at, recipient_count, open_rate (nullable)
```
Plus `GET /events/{id}/communications` and `POST /events/{id}/communications` (send + log) endpoints. `recipient_count`/`open_rate` imply this needs to integrate with an actual email/notification send pipeline, not just a table.

### 3. Community requests & stakeholders (`src/store/community-requests-store.ts`, `community-tab-store.ts` + `src/lib/community-requests.ts`)

**Stakeholders directory** (`mockStakeholders`) — need a `STAKEHOLDERS` table:
```
id, name, category,   -- Venue Partner / Sponsorship Partner / Guest Speaker / Volunteer — confirm fixed enum vs. lookup table
org, title, avatar_initials, bio, tags (array or join table)
```

**Community requests** (`CommunityRequest`) — organizer requesting a stakeholder's involvement in an event. Need a `COMMUNITY_REQUESTS` table:
```
id, event_id, stakeholder_id, category, message,
status,          -- interested / helping / passed
response_message, created_at, responded_at, reminded_at
```
Plus endpoints: list by event, create, respond, confirm, remove, nudge (mirrors the store's actions).

### 4. Attendee-facing history (`src/lib/attendee-history.ts`, used by `my-events/page.tsx`)

- **Past events attended** (`mockPastEvents`) — derivable from `ATTENDEES`/`REGISTRATIONS` (status = attended, event end_date < now) joined to `EVENTS`; recommend a `GET /users/{id}/past-events` endpoint instead of a new table.
- **Purchases** (`mockPurchases`) — need a `PURCHASES` table: `id, event_id, amount, purchased_at, status`. Confirm if a payment gateway integration already produces these records elsewhere.
- **Refund requests** (`mockRefundRequests`) — need a `REFUND_REQUESTS` table: `id, purchase_id (or event_id), amount, requested_at, status` (pending/approved/rejected).

### Not requesting (other stores)

- `events-filters-store`, `my-events-filters-store`, `community-tab-store` (filter state only), `event-wizard-store` — pure client-side UI state (active tab, selected filters, wizard step/form draft). No backend data involved.

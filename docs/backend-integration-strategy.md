                                              # # # # # # # # # # # # # #   # # # # # # # #                 90987# Backend Integration Strategy

Companion to [`oracle-adb-schema-gap-prompt.md`](./oracle-adb-schema-gap-prompt.md) (the gap analysis sent to the DB team). This doc turns those gaps into concrete table schemas, endpoint contracts, and a phased implementation order for the frontend integration work.

Backend is Oracle ADB via ORDS (`GCODE_Events_API`), base URL configured in `src/lib/api/client.ts` (`NEXT_PUBLIC_API_BASE_URL`). All requests go through `apiRequest()` there — it already handles ORDS's "200 + `{error}`" quirk.

**Note on current repo state:** `src/lib/api/events.ts` and `src/lib/api/adapters.ts` (the `/events` CRUD client + the `EventListItem`/`EventDetail` → UI `Event` adapter) were deleted in the last cleanup pass as dead code — nothing called them yet. They're still in git history at commit `c537952` (`Added Adapter and Basic Integration`) and their contents are reproduced in Phase 1 below verbatim; recover with `git show c537952:src/lib/api/events.ts` rather than retyping.

---

## 1. Schema

### 1.1 Already live (confirmed via `/events`, `/lookups/*`)

```sql
EVENTS
  id                    NUMBER PK
  event_type_id         NUMBER FK -> EVENT_TYPES.id
  event_name            VARCHAR2
  mode_of_event_id      NUMBER FK -> MODE_OF_EVENTS.id
  max_attendees         NUMBER NULL
  city                  VARCHAR2
  address               VARCHAR2 NULL
  status_id             NUMBER FK -> EVENT_STATUSES.id
  start_date            TIMESTAMP NULL
  end_date              TIMESTAMP NULL
  ticket_price          NUMBER
  is_featured           NUMBER(1)   -- 0/1
  cover_image_url       VARCHAR2 NULL
  banner_image_url      VARCHAR2 NULL
  participation_link    VARCHAR2 NULL
  registration_deadline TIMESTAMP NULL
  description           CLOB NULL
  created_by            VARCHAR2 NULL
  created_on            TIMESTAMP
  updated_by            VARCHAR2 NULL
  updated_on            TIMESTAMP NULL

EVENT_TYPES        (id, name, description)
EVENT_STATUSES     (id, status_code, status_name, description)   -- 7 codes, see below
MODE_OF_EVENTS     (id, mode_name, description)                  -- PHYSICAL / ONLINE / HYBRID
CATEGORIES         (id, category_name, description)
EVENT_CATEGORIES   (event_id, category_id)                       -- join table
```

`EVENT_STATUSES` fixed set: `DRAFT`, `APPROVAL_PENDING`, `OPEN`, `REGISTRATION_CLOSED`, `ONGOING`, `COMPLETED`, `CANCELLED`.

### 1.2 New columns on `EVENTS`

```sql
ALTER TABLE EVENTS ADD (
  team_size             VARCHAR2(50) NULL,   -- e.g. "2-4" — only if team registration is real
  certificate_offered    NUMBER(1) DEFAULT 0  -- 0/1
);
```

`duration` needs no column — derive from `start_date`/`end_date` client-side (confirm `end_date` is populated consistently first).

`registered_count`: **don't** denormalize onto `EVENTS` — derive from `REGISTRATIONS` via `COUNT(*)` (see 1.4). Avoids a sync bug class.

### 1.3 New child tables on `EVENTS`

```sql
EVENT_AGENDA_ITEMS
  id            NUMBER PK
  event_id      NUMBER FK -> EVENTS.id
  sort_order    NUMBER
  time_label    VARCHAR2    -- free text, e.g. "10:00 AM" (matches wizard's free-text input)
  title         VARCHAR2
  description   VARCHAR2

EVENT_SOCIAL_LINKS
  id            NUMBER PK
  event_id      NUMBER FK -> EVENTS.id
  platform      VARCHAR2
  url           VARCHAR2

EVENT_TERMS
  id            NUMBER PK
  event_id      NUMBER FK -> EVENTS.id
  sort_order    NUMBER
  term_text     VARCHAR2
```

(`EVENT_TERMS` could instead be a single CLOB column on `EVENTS` if terms are just a paragraph, not a list — confirm with design before building the table. `EventDetailData` in the wizard doesn't currently have a terms field at all, so this is lower priority than agenda/social-links, which the wizard already collects.)

### 1.4 Registrations / attendees

```sql
REGISTRATIONS
  id                  NUMBER PK
  event_id            NUMBER FK -> EVENTS.id
  user_id             NUMBER FK -> USERS.id NULL   -- see 1.7, nullable until auth lands
  name                VARCHAR2
  email               VARCHAR2
  role                VARCHAR2   -- Fresher / Startup Founder / Domain Expert / Institution — confirm fixed enum vs free text
  ticket_type         VARCHAR2   -- Free / Paid
  amount_paid         NUMBER NULL
  status              VARCHAR2   -- registered / attended / missed / cancelled
  certificate_issued  NUMBER(1) DEFAULT 0
  registered_at       TIMESTAMP
```

`avatarInitials` in the UI type is derived client-side from `name`, not stored.
`registeredCount` = `SELECT COUNT(*) FROM REGISTRATIONS WHERE event_id = :id AND status != 'cancelled'`.

### 1.5 Community requests & stakeholders

```sql
STAKEHOLDERS
  id              VARCHAR2 PK      -- existing mock data uses slug ids, keep that convention
  name            VARCHAR2
  category        VARCHAR2         -- Venue Partner / Sponsorship Partner / Guest Speaker / Volunteer
  org             VARCHAR2 NULL
  title           VARCHAR2 NULL
  avatar_initials VARCHAR2 NULL
  bio             VARCHAR2 NULL

STAKEHOLDER_TAGS
  stakeholder_id  VARCHAR2 FK -> STAKEHOLDERS.id
  tag             VARCHAR2

COMMUNITY_REQUESTS
  id                NUMBER PK
  event_id          NUMBER FK -> EVENTS.id
  stakeholder_id    VARCHAR2 FK -> STAKEHOLDERS.id
  category          VARCHAR2
  message           VARCHAR2
  status            VARCHAR2    -- interested / helping / passed
  response_message  VARCHAR2 NULL
  created_at        TIMESTAMP
  responded_at      TIMESTAMP NULL
  reminded_at       TIMESTAMP NULL
```

### 1.6 Communications

```sql
COMMUNICATION_LOGS
  id               NUMBER PK
  event_id         NUMBER FK -> EVENTS.id
  subject          VARCHAR2
  message          CLOB
  sent_at          TIMESTAMP
  recipient_count  NUMBER
  open_rate        NUMBER NULL   -- requires actual email pipeline tracking opens; leave NULL until that exists
```

### 1.7 Attendee-facing history (needs user identity)

```sql
USERS  -- prerequisite, doesn't exist yet in any form
  id           NUMBER PK
  name         VARCHAR2
  email        VARCHAR2
  role         VARCHAR2   -- attendee / organizer / both
  ...auth columns per whatever auth provider is chosen

PURCHASES
  id             NUMBER PK
  user_id        NUMBER FK -> USERS.id
  event_id       NUMBER FK -> EVENTS.id
  amount         NUMBER
  purchased_at   TIMESTAMP
  status         VARCHAR2   -- paid (extend as gateway integration matures)

REFUND_REQUESTS
  id             NUMBER PK
  purchase_id    NUMBER FK -> PURCHASES.id
  amount         NUMBER
  requested_at   TIMESTAMP
  status         VARCHAR2   -- pending / approved / rejected
```

"Past events attended" needs no new table — derive from `REGISTRATIONS` (`status = 'attended'`) joined to `EVENTS`.

**`USERS` is the one genuine blocker.** Nothing in the current frontend has an auth/session concept — `created_by` on `EVENTS` is a free-text string, not a FK. Registrations, purchases, and refunds all want a real `user_id`. Decide the auth provider before Phase 3 below; everything before that can ship without it.

---

## 2. Endpoints

### 2.1 Already implemented client-side (recover from git, see note above)

| Method | Path                                                                                       | Notes                                          |
| ------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| GET    | `/events?is_featured=&type_id=&category_id=&search=`                                       | list, paginated (`ApiListResponse`)            |
| GET    | `/events/{id}?include=`                                                                    | detail                                         |
| POST   | `/events`                                                                                  | create — `CreateEventPayload`                  |
| PUT    | `/events/{id}`                                                                             | update — `Partial<CreateEventPayload>`         |
| DELETE | `/events/{id}`                                                                             |                                                |
| POST   | `/events/{id}/categories/{categoryId}`                                                     | assign category                                |
| DELETE | `/events/{id}/categories/{categoryId}`                                                     | remove category                                |
| GET    | `/lookups/event-types` \| `/lookups/statuses` \| `/lookups/modes` \| `/lookups/categories` | cached client-side in `src/lib/api/lookups.ts` |

### 2.2 New — Events content (agenda/social-links/terms)

| Method | Path                        | Body / Query                                                                                     |
| ------ | --------------------------- | ------------------------------------------------------------------------------------------------ |
| PUT    | `/events/{id}/agenda-items` | `{time, title, description}[]` — bulk replace-all, matches wizard editing the whole list at once |
| PUT    | `/events/{id}/social-links` | `{platform, url}[]` — bulk replace-all                                                           |
| PUT    | `/events/{id}`              | if terms end up as a CLOB column, folds into the existing update payload — no new endpoint       |

Bulk replace (not per-item CRUD) matches how `StepAgendaLinks`/`StepAgendaLinks` edit these as whole-array form state — per-item endpoints would need optimistic-diffing the frontend doesn't do today.

### 2.3 New — Registrations / attendees

| Method | Path                                                 | Notes                                                                                                                            |
| ------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/events/{id}/attendees?status=&query=&page=&limit=` | powers `attendees-tab.tsx`'s filter/search/pagination                                                                            |
| POST   | `/events/{id}/attendees`                             | register (attendee-facing, not yet in this UI but needed eventually)                                                             |
| PATCH  | `/events/{id}/attendees/{attendeeId}`                | status changes, e.g. mark attended                                                                                               |
| GET    | `/events/{id}/attendees/count`                       | or just rely on `hasMore`/`count` from the list response — avoid a separate endpoint if `ApiListResponse.count` already gives it |

### 2.4 New — Stakeholders & community requests

| Method | Path                              | Notes                                                                                       |
| ------ | --------------------------------- | ------------------------------------------------------------------------------------------- |
| GET    | `/stakeholders?category=&query=`  | powers `StepCommunityRequest`'s search+filter, replaces `mockStakeholders`                  |
| GET    | `/events/{id}/community-requests` | powers `CommunityTab`                                                                       |
| POST   | `/events/{id}/community-requests` | bulk create — body is `SelectedStakeholder[]`, matches `onAddRequests`                      |
| PATCH  | `/community-requests/{id}`        | body `{status, response_message?, reminded_at?}` — covers confirm/nudge/respond in one verb |
| DELETE | `/community-requests/{id}`        | remove                                                                                      |

### 2.5 New — Communications

| Method | Path                          | Notes                                                                                                                                                                                     |
| ------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/events/{id}/communications` | log list for `CommunicationTab`                                                                                                                                                           |
| POST   | `/events/{id}/communications` | send + log in one call — `{subject, message, recipient_mode \| recipient_ids}`; actual email dispatch is a separate concern from this table write, flag to whoever owns the send pipeline |

### 2.6 New — Attendee-facing history (post-auth)

| Method | Path                              | Notes                      |
| ------ | --------------------------------- | -------------------------- |
| GET    | `/users/{id}/past-events`         | derived join, no new table |
| GET    | `/users/{id}/purchases`           |                            |
| GET    | `/users/{id}/refund-requests`     |                            |
| POST   | `/purchases/{id}/refund-requests` |                            |

---

## 3. Phased rollout

Ordered by dependency and by how much dead frontend code each phase unblocks.

**Phase 1 — Core event CRUD (no new DB work, just wiring)**
Restore `lib/api/events.ts` + `lib/api/adapters.ts` from git history. Wire `EventWizard.handleCreate`/`handleUpdate` (currently TODO stubs in `event-wizard.tsx`) to `createEvent`/`updateEvent`. Wire `events/page.tsx`, `my-events/page.tsx`, `my-organized-events/page.tsx` list views to `listEvents`. This alone turns most of the app from all-mock to real, using tables that already exist.

**Phase 2 — Event content gaps**
Add `EVENT_AGENDA_ITEMS`, `EVENT_SOCIAL_LINKS` tables + the two bulk-replace endpoints. Unblocks `StepAgendaLinks` actually persisting, and the event detail page showing real agenda/links instead of always-empty arrays.

**Phase 3 — Registrations**
Add `REGISTRATIONS` table + attendee endpoints. This is the biggest unlock: real `registeredCount`/`spotsLeft` on `Event`, `attendees-tab.tsx`, `overview-tab.tsx` stats, and `communication-tab.tsx`'s recipient counts all currently fake this. Can ship with `user_id` nullable — don't block on auth.

**Phase 4 — Community requests & stakeholders**
Add `STAKEHOLDERS`, `STAKEHOLDER_TAGS`, `COMMUNITY_REQUESTS` tables + endpoints. Replaces `mockStakeholders`/in-memory `requests` state in `CommunityTab` and the wizard's community-request step.

**Phase 5 — Communications log**
Add `COMMUNICATION_LOGS` + endpoints. Lower priority than 3/4 since it's currently the only tab where "fake send" doesn't visibly break anything else (no cross-tab dependency).

**Phase 6 — Auth / user identity**
Stand up `USERS` + whatever auth provider is chosen. This is the actual prerequisite for Phase 7, and also for turning `created_by` on `EVENTS` from a free-text string into a real FK — worth doing before Phase 7 rather than after, since retrofitting auth onto already-shipped registration flows is more painful than building it in from the start.

**Phase 7 — Attendee-facing history**
`PURCHASES`, `REFUND_REQUESTS` tables + endpoints, once `USERS` exists. Lowest priority — `my-events/page.tsx`'s past/purchases/refunds tabs are the least-connected part of the app today.

**Deferred / confirm-before-building**

- `team_size` column — only add if team-based registration is a confirmed real feature, not speculative.
- `EVENT_TERMS` as a table vs. CLOB — wizard doesn't collect this yet, don't build ahead of the form.
- `open_rate` on `COMMUNICATION_LOGS` — meaningless without an actual email-open-tracking pipeline; leave the column nullable and unpopulated until that pipeline exists.

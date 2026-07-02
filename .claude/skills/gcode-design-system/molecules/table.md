# Table

## Purpose

Displays structured, row-based data (attendee rosters, community responses) with optional row selection. Generic and data-driven — columns are configured by the caller, not baked into the component, so one Table serves multiple data shapes.

---

## Anatomy

```
┌─────────────────────────────────────────┐
│ [ ] │ Name       │ Role     │ Status     │
├─────────────────────────────────────────┤
│ [x] │ ████████   │ Fresher  │ Confirmed  │
│ [ ] │ ████████   │ Expert   │ Confirmed  │
└─────────────────────────────────────────┘
```

---

## States

Default row (hover highlight).

Selected row (checkbox checked).

Header select-all: unchecked / indeterminate / checked.

Empty (falls back to `EmptyState`, or caller-supplied `emptyState`).

---

## Uses

→ atoms/checkbox.md
→ molecules/empty-state.md

---

## Usage Guidelines

Use for any list of records that benefits from column alignment and optional bulk selection (attendee rosters, community-request responses). Pair with `Pagination` for large lists and `BulkActionBar` when `selectable` is enabled. Cell content is fully caller-composed (`Blurred`, `Badge`, buttons) via each column's `render` function — the Table itself has no knowledge of the underlying data shape.

Do not use for simple key/value display (use a definition-list pattern instead) or for fewer than ~4 rows where a plain list reads better.

---

## Related Components

→ molecules/pagination.md
→ molecules/bulk-action-bar.md
→ atoms/blurred.md
→ atoms/badge.md

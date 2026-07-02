# Bulk Action Bar

## Purpose

Contextual toolbar that appears above a `Table` once one or more rows are selected, surfacing actions that apply to the whole selection (e.g. "Send Email to Selected", "Remove Selected").

---

## Anatomy

```
┌───────────────────────────────────────────────┐
│ 3 selected   [Send Email]  [Export]   Clear    │
└───────────────────────────────────────────────┘
```

---

## States

Hidden — renders nothing when `selectedCount` is 0 (caller does not need to conditionally render it).

Visible — tinted bar with count, action buttons, and a trailing "Clear" action.

---

## Uses

→ atoms/button.md

---

## Usage Guidelines

Pair directly with a selectable `Table`. Keep the action list short (2-3 actions) — anything more belongs in a dropdown, not this bar. Always include a way to clear the selection.

---

## Related Components

→ molecules/table.md

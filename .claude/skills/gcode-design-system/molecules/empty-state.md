# Empty State

## Purpose

A standardized view for when there is no data to display.

---

## Anatomy

```
┌──────────────────┐
│       (i)        │
│   No Results     │
│    Try again.    │
│     [Button]     │
└──────────────────┘
```

---

## Variants

Default

---

## Sizes

MD

---

## States

Default
Active

---

## Design Tokens

Background
→ tokens/colors.md
Radius
→ tokens/radius.md

---

## Accessibility

Focus ring
Visible

---

## Example

```html
<div class="g-empty-state">
  <div class="g-empty-state__icon"><i data-lucide="calendar" class="g-icon"></i></div>
  <h4 class="g-empty-state__title">No Upcoming Events</h4>
  <p class="g-empty-state__desc">You haven't registered for any events yet.</p>
  <button class="g-btn g-btn--primary">Browse Events</button>
</div>
```

## Responsive

Adjusts to fit container width.

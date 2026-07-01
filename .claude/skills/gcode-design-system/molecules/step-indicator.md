# Step Indicator

## Purpose

Visually represents a user's progress through a multi-step process or wizard (e.g., Hosting an Event).

---

## Composition

List Container + Step Circles (Atoms/Badges) + Connecting Lines (Divider Atoms) + Step Labels (Text Atoms).

---

## States

Completed (Checkmark icon, solid fill)

Current (Number, bold border/fill)

Upcoming (Number, dashed border or gray fill)

---

## Responsive

Horizontal on desktop, might scroll or wrap on very small screens.

---

## Uses

→ atoms/icon.md
→ atoms/divider.md

---

## Example

```html
<div class="g-step-indicator">
  <div class="g-step-indicator__step g-step-indicator__step--completed">
    <div class="g-step-indicator__circle">✓</div>
    <span class="g-step-indicator__label">Type</span>
  </div>
  <div class="g-step-indicator__line g-step-indicator__line--completed"></div>
  <div class="g-step-indicator__step g-step-indicator__step--current">
    <div class="g-step-indicator__circle">2</div>
    <span class="g-step-indicator__label">Details</span>
  </div>
</div>
```

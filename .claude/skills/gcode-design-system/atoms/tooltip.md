# Tooltip

## Purpose

Provides extra context on hover without cluttering the UI.

---

## Anatomy

```
┌──────────┐
│ Tooltip  │
└────┬─────┘
     ▼
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
<div class="g-tooltip-wrapper">
  <button class="g-btn g-btn--secondary">Hover me</button>
  <div class="g-tooltip">This is a helpful tooltip!</div>
</div>
```

## Responsive

Adjusts to fit container width.

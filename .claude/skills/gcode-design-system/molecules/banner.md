# Banner

## Purpose

Full-width or embedded alerts to communicate system states.

---

## Anatomy

```
┌──────────────────┐
│ (i) Message      │
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
<div class="g-banner g-banner--success">
  <i data-lucide="check-circle" class="g-icon"></i>
  <div class="g-banner__content">Success!</div>
</div>
```

## Responsive

Adjusts to fit container width.

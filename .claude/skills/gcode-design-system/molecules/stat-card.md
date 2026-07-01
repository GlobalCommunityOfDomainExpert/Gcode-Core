# Stat Card

## Purpose

Displays a single metric with a label, value, and optional trend or sub-text.

---

## Anatomy

```
┌──────────────────────┐
│ LABEL                │
│ Value         [+12%] │
│ sub-text             │
└──────────────────────┘
```

---

## Composition

Label + Value + Sub-text / Trend Badge

---

## States

Default

Hover

---

## Design Tokens

Background
→ tokens/colors.md

Typography
→ foundations/typography.md

---

## Responsive

100% cell width in flex or CSS grid. Collapses to 1-column on mobile.

---

## Uses

→ atoms/badge.md

---

## Example

```html
<div class="g-stat-card">
  <div class="g-stat-card__label">Total Registrations</div>
  <div class="g-stat-card__value">148</div>
  <div class="g-stat-card__sub">+12 this week</div>
</div>

<!-- With trend indicator -->
<div class="g-stat-card">
  <div class="g-stat-card__label">Total Earned</div>
  <div class="g-stat-card__value">₹48,500</div>
  <div class="g-stat-card__sub g-text-success">+12%</div>
</div>
```

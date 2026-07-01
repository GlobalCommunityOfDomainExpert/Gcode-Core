# Selectable Card

## Purpose

Large, clickable card acting as a radio button for primary choices (e.g., Event Type).

---

## Composition

Card + Icon + Title + Subtitle.

---

## States

Default (Unselected)

Hover (Border highlight)

Active (Selected - thick border, primary color)

---

## Responsive

Usually set in a grid that switches to 1-column on mobile.

---

## Uses

→ atoms/icon.md

---

## Example

```html
<button class="g-selectable-card g-selectable-card--active">
  <div class="g-selectable-card__icon">💻</div>
  <h4 class="g-selectable-card__title">Hackathon</h4>
  <p class="g-selectable-card__desc">Build sprints</p>
</button>
<button class="g-selectable-card">
  <div class="g-selectable-card__icon">⭐</div>
  <h4 class="g-selectable-card__title">Expert AMA</h4>
  <p class="g-selectable-card__desc">Live Q&A</p>
</button>
```

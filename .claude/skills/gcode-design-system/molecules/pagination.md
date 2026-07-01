# Pagination

## Purpose

Controls for navigating through long lists, feeds, or data tables.

---

## Anatomy

```
[←] [1] [2] [3] [→]
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
<div class="g-pagination">
  <button class="g-pagination__btn" disabled>←</button>
  <button class="g-pagination__btn g-pagination__btn--active">1</button>
  <button class="g-pagination__btn">2</button>
  <button class="g-pagination__btn">→</button>
</div>
```

## Responsive

Adjusts to fit container width.

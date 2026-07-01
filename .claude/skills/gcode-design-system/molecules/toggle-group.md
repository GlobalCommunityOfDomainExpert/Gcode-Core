# Toggle Group

## Purpose

Provides a segmented control for users to make a single selection from mutually exclusive options (e.g., Mode: Online / In-Person / Hybrid).

---

## Composition

Flex/Grid Container + Multiple Toggle Buttons (styled similarly to tabs or bordered buttons).

---

## States

Selected (Active)

Unselected (Default)

---

## Responsive

Can stack or wrap on very small screens, usually placed in a grid.

---

## Uses

→ atoms/button.md (conceptually similar)

---

## Example

```html
<div class="g-toggle-group">
  <button class="g-toggle-group__btn g-toggle-group__btn--active">Online</button>
  <button class="g-toggle-group__btn">In-Person</button>
  <button class="g-toggle-group__btn">Hybrid</button>
</div>
```

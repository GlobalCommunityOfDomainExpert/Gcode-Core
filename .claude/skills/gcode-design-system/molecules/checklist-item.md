# Checklist Item

## Purpose

Shows a single task or validation step with completed or pending state.

---

## Anatomy

```
┌────┐  Label text
│ ✓  │  Sub-text
└────┘
```

---

## Composition

Check circle + Label + Optional sub-text

---

## States

Completed

Pending

---

## Design Tokens

Color
→ tokens/colors.md

Radius
→ tokens/radius.md

---

## Responsive

Row flex. Label wraps on narrow containers.

---

## Uses

→ atoms/checkbox.md

---

## Example

```html
<!-- Completed -->
<div class="g-checklist-item">
  <div class="g-checklist-item__check">
    <span>✓</span>
  </div>
  <div class="g-checklist-item__label">Registration complete</div>
</div>

<!-- Pending -->
<div class="g-checklist-item g-checklist-item--pending">
  <div class="g-checklist-item__check g-checklist-item__check--pending"></div>
  <div class="g-checklist-item__label">Save the date</div>
</div>
```

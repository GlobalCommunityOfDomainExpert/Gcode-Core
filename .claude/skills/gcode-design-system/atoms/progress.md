# Progress Bar

## Purpose

Indicates the completion status of a task or process.

---

## Anatomy

```
┌──────────────────┐
│ ■■■■■■           │
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
<div class="g-progress">
  <div
    class="g-progress__bar g-progress__bar--success"
    style="width: 75%;"
  ></div>
</div>
```

## Responsive

Adjusts to fit container width.

# Select

## Purpose

Allows users to choose one option from a dropdown list.

---

## Anatomy

```
┌──────────────┐
│ Option     ▼ │
└──────────────┘
```

---

## Variants

Default

Outline

---

## Sizes

SM

MD

---

## States

Default

Focus

Disabled

Error

---

## Design Tokens

Border, Background

→ tokens/colors.md

---

## Accessibility

Must have an associated label. Ensure it can be navigated via keyboard (up/down arrows).

---

## Example

```html
<select class="g-select">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

## Responsive

Adjusts to fit container width. Grids collapse to 1-column on mobile screens (max-width: 768px).

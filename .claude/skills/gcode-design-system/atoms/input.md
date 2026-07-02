# Input

## Purpose

Allows users to enter text strings.

---

## Anatomy

```
┌────────────────────────┐
│ Input Placeholder      │
└────────────────────────┘
```

---

## Variants

Text

Password

Email

Number

---

## Sizes

SM

MD

LG

---

## States

Default

Hover

Focus

Disabled

Error

---

## Design Tokens

Border

→ tokens/colors.md

---

## Accessibility

Keyboard focus ring is mandatory. Form fields must be paired with labels.

---

## Example

```html
<input type="text" class="g-input" placeholder="Enter text..." />
```

## Responsive

Adjusts to fit container width. Grids collapse to 1-column on mobile screens (max-width: 768px).

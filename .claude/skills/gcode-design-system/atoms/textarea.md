# Textarea

## Purpose

Allows users to enter multi-line text input.

---

## Anatomy

```
┌──────────────┐
│ Text Input   │
│              │
│              │
└──────────────┘
```

---

## Variants

Default

Filled

Outline

---

## Sizes

Default (Variable rows)

---

## States

Default

Focus

Disabled

Error

---

## Design Tokens

Border, Background, Shadow

→ tokens/colors.md

---

## Accessibility

Must have an associated label. Use aria-invalid for error states.

---

## Example

```html
<textarea class="g-textarea" rows="4" placeholder="Enter details"></textarea>
```

## Responsive

Adjusts to fit container width. Grids collapse to 1-column on mobile screens (max-width: 768px).

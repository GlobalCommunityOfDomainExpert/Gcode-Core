# Link

## Purpose

Navigates users to another page or triggers an action that doesn't feel like a primary button.

---

## Anatomy

```
┌──────────────┐
│  [Text]      │
└──────────────┘
```

---

## Variants

Primary (Blue)

Secondary (Gray)

---

## Sizes

SM

MD

---

## States

Default

Hover (Underline)

---

## Design Tokens

Color

→ tokens/colors.md

---

## Accessibility

Ensure clear focus states for keyboard navigation. Links should have descriptive text.

---

## Example

```html
<a href="#" class="g-link text-blue-500 hover:underline">Click Here</a>
```

## Responsive

Adjusts to fit container width. Grids collapse to 1-column on mobile screens (max-width: 768px).

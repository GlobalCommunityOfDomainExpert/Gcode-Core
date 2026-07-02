# Switch

## Purpose

Toggles preferences on/off instantly.

---

## Anatomy

```
┌─────────┐
│  ( )    │
└─────────┘
```

---

## Variants

Default

Labelled

---

## Sizes

MD

---

## States

Checked

Unchecked

Disabled

---

## Design Tokens

Background

→ tokens/colors.md

---

## Accessibility

Aria-role="switch". Keyboard toggle via Space.

---

## Example

```html
<label class="g-switch">
  <input type="checkbox" />
  <span class="g-switch__slider"></span>
</label>
```

## Responsive

Adjusts to fit container width. Grids collapse to 1-column on mobile screens (max-width: 768px).

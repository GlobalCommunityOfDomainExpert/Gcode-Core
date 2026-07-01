# Chip

## Purpose

Inline toggle tag for filtering or multi-selecting categories.

---

## Anatomy

```
┌──────────────┐
│   Label      │
└──────────────┘
```

---

## Variants

Default (unselected)

Active (selected)

---

## States

Default

Active

Hover

Disabled

---

## Design Tokens

Background
→ tokens/colors.md

Radius
→ tokens/radius.md

Typography
→ foundations/typography.md

---

## Accessibility

Keyboard

Space / Enter to toggle

Role

`button` or `checkbox`

---

## Example

```html
<button class="g-chip">Tech</button>
<button class="g-chip g-chip--active">Legal/CA</button>
<button class="g-chip">Growth</button>
```

## Responsive

Wraps in flex row. Use `g-flex--wrap` on parent to allow multi-line.

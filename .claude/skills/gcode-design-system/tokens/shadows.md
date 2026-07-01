# Shadow Tokens

## Purpose

Shadows create visual elevation. GCODE shadows are tinted with the brand primary color (`rgba(26, 47, 63, x)`) — NOT generic black (`rgba(0,0,0,x)`). This keeps the depth system on-brand.

---

## Scale

| Token | Value | Use |
|---|---|---|
| `--g-shadow-inner` | `inset 0 2px 4px rgba(26, 47, 63, 0.02)` | Input fields, pressed states |
| `--g-shadow-sm` | `0 1px 4px rgba(26, 47, 63, 0.02)` | Cards at rest, dropdowns, subtle lift |
| `--g-shadow-md` | `0 4px 16px rgba(26, 47, 63, 0.04)` | Hovered cards, modals, panels |
| `--g-shadow-lg` | `0 16px 40px rgba(26, 47, 63, 0.08)` | Floating elements (FAB, bottom sheets, tooltips) |

---

## CSS Variable Block

```css
:root {
  --g-shadow-inner: inset 0 2px 4px rgba(26, 47, 63, 0.02);
  --g-shadow-sm:    0 1px 4px rgba(26, 47, 63, 0.02);
  --g-shadow-md:    0 4px 16px rgba(26, 47, 63, 0.04);
  --g-shadow-lg:    0 16px 40px rgba(26, 47, 63, 0.08);
}
```

---

## Rules

- Cards default to `--g-shadow-sm`. On hover: `--g-shadow-md`.
- Never use `box-shadow: none` to remove focus rings — use `outline` instead.
- Do NOT use black-tinted shadows (`rgba(0,0,0,x)`) — this breaks the warm brand feel.
- Floating action buttons and modals use `--g-shadow-lg`.

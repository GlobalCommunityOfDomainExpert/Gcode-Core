# Radius Tokens

## Purpose

Consistent corner rounding across all components.

---

## Scale

| Token | Value | Use |
|---|---|---|
| `--g-radius-sm` | `6px` | Buttons, inputs, chips, small badges |
| `--g-radius-md` | `12px` | Cards, modals, panels, table wrapper |
| `--g-radius-lg` | `18px` | Large cards, event banners, hero sections |
| `--g-radius-full` | `9999px` | Pills, avatars, progress bars, filter chips |

---

## CSS Variable Block

```css
:root {
  --g-radius-sm:   6px;
  --g-radius-md:   12px;
  --g-radius-lg:   18px;
  --g-radius-full: 9999px;
}
```

---

## Rules

- Do NOT use `border-radius: 4px` or other raw values — always reference a token.
- Prefer `--g-radius-sm` for interactive elements (buttons, inputs) — feels tighter and more functional.
- Prefer `--g-radius-md` for content containers (cards, panels).
- Use `--g-radius-full` for pill-shaped elements only (avatars, badges, progress tracks).

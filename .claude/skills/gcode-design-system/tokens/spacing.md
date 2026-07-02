# Spacing Tokens

## Purpose

A small, consistent spacing scale used for padding, gap, and margin throughout all components.

---

## Scale

| Token          | Value     | px equiv | Use                                      |
| -------------- | --------- | -------- | ---------------------------------------- |
| `--g-space-xs` | `0.25rem` | 4px      | Tight gaps, icon-to-label, badge padding |
| `--g-space-sm` | `0.5rem`  | 8px      | Input padding, avatar gap, list item gap |
| `--g-space-md` | `1rem`    | 16px     | Card padding (compact), section gaps     |
| `--g-space-lg` | `1.5rem`  | 24px     | Card padding (default), grid gaps        |
| `--g-space-xl` | `2rem`    | 32px     | Page padding, large section gaps         |

---

## CSS Variable Block

```css
:root {
  --g-space-xs: 0.25rem;
  --g-space-sm: 0.5rem;
  --g-space-md: 1rem;
  --g-space-lg: 1.5rem;
  --g-space-xl: 2rem;
}
```

---

## Rules

- Always pick the nearest token — don't invent `14px` or `20px` raw values.
- For layout-level spacing (page margins, sidebar width, navbar height), use the layout-specific tokens in `tokens/colors.md` (`--g-navbar-height`, `--g-sidebar-width`).
- Utility classes `g-mb-*`, `g-mt-*`, `g-pb-*` map to multiples of this scale — see `foundations/utilities.md`.

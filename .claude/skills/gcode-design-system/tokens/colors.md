# GCODE Design Tokens — Colors

## Purpose

This document defines every color token available within the GCODE Design System.

Components must consume these tokens directly. Hardcoded colors are prohibited.

---

# Brand

## Primary

| Token                 | Value                  |
| --------------------- | ---------------------- |
| --color-primary       | hsl(206, 42%, 18%)     |
| --color-primary-hover | hsl(206, 42%, 24%)     |
| --color-primary-light | hsla(206,42%,18%,0.08) |

---

## Secondary

| Token                   | Value                 |
| ----------------------- | --------------------- |
| --color-secondary       | hsl(0,100%,45%)       |
| --color-secondary-hover | hsl(0,100%,38%)       |
| --color-secondary-light | hsla(0,100%,45%,0.08) |

---

# Semantic

## Success

| Token                 | Value                  |
| --------------------- | ---------------------- |
| --color-success       | hsl(142,60%,40%)       |
| --color-success-light | hsla(142,60%,40%,0.10) |

## Warning

...

## Danger

...

---

# Neutral

## Background

| Token             | Value           |
| ----------------- | --------------- |
| --color-bg-light  | hsl(30,10%,96%) |
| --color-bg-subtle | hsl(30,10%,98%) |

## Surface

| Token                 | Value          |
| --------------------- | -------------- |
| --color-surface-light | hsl(0,0%,100%) |

## Text

| Token                  | Value            |
| ---------------------- | ---------------- |
| --color-text-primary   | hsl(30,8%,12%)   |
| --color-text-secondary | hsl(210,12%,40%) |

## Border

| Token                | Value              |
| -------------------- | ------------------ |
| --color-border-light | rgba(26,47,63,.08) |
| --color-border-hover | rgba(26,47,63,.16) |

---

# Naming Rules

Brand
Semantic
Neutral
State

No component-specific colors may be defined here.

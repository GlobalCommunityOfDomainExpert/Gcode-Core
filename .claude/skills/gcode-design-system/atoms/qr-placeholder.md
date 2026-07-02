# QR Placeholder

## Purpose

Placeholder block that represents a QR code in ticket and confirmation screens. Replaced with a real QR image at runtime.

---

## Anatomy

```
┌──────────┐
│          │
│  QR Code │
│          │
└──────────┘
```

---

## Variants

Default (96×96px)

---

## States

Default

Loading

---

## Design Tokens

Background
→ tokens/colors.md

Radius
→ tokens/radius.md

---

## Example

```html
<div class="g-qr-placeholder">QR<br />Code</div>

<!-- At runtime, replace with: -->
<img
  class="g-qr-placeholder"
  src="/api/qr/GCODE-2026-48291"
  alt="QR code for GCODE-2026-48291"
/>
```

## Responsive

Fixed square dimensions. Does not scale with container.

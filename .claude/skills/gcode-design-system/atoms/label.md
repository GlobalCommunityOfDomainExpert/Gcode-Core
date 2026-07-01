# Label

## Purpose

Describes the purpose of an input field, select, or textarea for the user.

---

## Anatomy

```
┌──────────────┐
│ Label Text * │
└──────────────┘
```

---

## Variants

Default

Required (with red asterisk)

---

## Sizes

SM

MD

---

## States

Default

Disabled

Error

---

## Design Tokens

Text Color

→ tokens/colors.md

---

## Accessibility

Must be linked to an input via the `for` attribute corresponding to the input's `id`.

---

## Example

```html
<label class="g-label">Email Address <span class="required">*</span></label>
```

## Responsive

Adjusts to fit container width. Grids collapse to 1-column on mobile screens (max-width: 768px).

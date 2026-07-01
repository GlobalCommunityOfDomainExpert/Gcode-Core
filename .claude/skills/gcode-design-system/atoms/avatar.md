# Avatar

## Purpose

Displays user profile thumbnail or initials.

---

## Anatomy

```
┌──────────────┐
│  ( Image ) ● │
└──────────────┘
```

---

## Variants

Circle

Square

---

## Sizes

SM

MD

LG

---

## States

Default

Hover

---

## Design Tokens

Radius

→ tokens/radius.md

---

## Accessibility

Required Alt tags for images. Status badge should have aria-label.

---

## Example

```html
<div class="g-avatar">
  <img src="user.jpg" alt="Profile" />
</div>
```


## Responsive

Adjusts to fit container width. Grids collapse to 1-column on mobile screens (max-width: 768px).

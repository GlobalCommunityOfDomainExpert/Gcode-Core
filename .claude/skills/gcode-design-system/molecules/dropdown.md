# Dropdown Menu

## Purpose

Contextual menus that appear when a user clicks a trigger button.

---

## Anatomy

```
┌────────────┐
│ Item 1     │
│ Item 2     │
├────────────┤
│ Item 3     │
└────────────┘
```

---

## Variants

Default

---

## Sizes

MD

---

## States

Default
Active

---

## Design Tokens

Background
→ tokens/colors.md
Radius
→ tokens/radius.md

---

## Accessibility

Focus ring
Visible

---

## Example

```html
<div class="g-dropdown-wrapper">
  <button class="g-btn g-btn--secondary">Actions ▾</button>
  <div class="g-dropdown g-dropdown--open">
    <a href="#" class="g-dropdown__item">Edit</a>
    <div class="g-dropdown__divider"></div>
    <a href="#" class="g-dropdown__item">Sign Out</a>
  </div>
</div>
```

## Responsive

Adjusts to fit container width.

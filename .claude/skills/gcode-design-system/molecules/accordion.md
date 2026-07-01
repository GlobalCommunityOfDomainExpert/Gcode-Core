# Accordion

## Purpose

Collapsible content panels used for FAQs or dense information screens.

---

## Anatomy

```
┌──────────────────┐
│ Title          ▼ │
├──────────────────┤
│ Content          │
└──────────────────┘
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
<div class="g-accordion">
  <div class="g-accordion__item g-accordion__item--open">
    <button class="g-accordion__header">Title <i data-lucide="chevron-down" class="g-icon g-accordion__icon"></i></button>
    <div class="g-accordion__body">Content</div>
  </div>
</div>
```

## Responsive

Adjusts to fit container width.

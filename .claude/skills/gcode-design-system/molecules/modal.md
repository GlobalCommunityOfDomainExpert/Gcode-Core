# Modal

## Purpose

Captures user attention for critical actions.

---

## Anatomy

```
┌──────────────────┐
│ Header       [x] │
├──────────────────┤
│ Body             │
├──────────────────┤
│ Cancel    Action │
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
<div class="g-modal-overlay g-modal-overlay--open">
  <div class="g-modal">
    <div class="g-modal__header">
      <h3 class="g-modal__title">Title</h3>
      <button class="g-modal__close">
        <i data-lucide="x" class="g-icon"></i>
      </button>
    </div>
    <div class="g-modal__body"><p>Content</p></div>
    <div class="g-modal__footer">
      <button class="g-btn g-btn--secondary">Cancel</button>
      <button class="g-btn g-btn--primary">Action</button>
    </div>
  </div>
</div>
```

## Responsive

Adjusts to fit container width.

# Problem Card

## Purpose

Displays a feed item for problems posted by founders, providing deep context and micro-actions for experts.

---

## Composition

Container + Tags (Domain, Urgency) + "Why matched" snippet + Title + "What I've tried" snippet + Action Buttons

---

## States

Default

Hover

---

## Responsive

Full width on mobile screens.

---

## Uses

→ atoms/badge.md
→ atoms/button.md
→ atoms/icon.md

---

## Example

```html
<div class="g-problem-card">
  <div class="g-problem-card__top">
    <div class="g-problem-card__tags">
      <span class="g-badge">Legal/CA</span>
      <span class="g-badge g-badge--warning"><i data-lucide="zap" class="g-icon" style="width: 12px; height: 12px;"></i> Urgent</span>
    </div>
    <div class="g-problem-card__reason">Why matched: Legal expertise</div>
  </div>
  
  <h4 class="g-problem-card__title">Need help with CA compliance for fundraising</h4>
  <p class="g-problem-card__snippet"><strong>What I've tried:</strong> We incorporated 2 months ago and angels are asking for our cap table and compliance certificates, but we are confused by the requirements...</p>
  
  <div class="g-problem-card__actions">
    <button class="g-btn g-btn--secondary"><i data-lucide="message-square" class="g-icon" style="width: 14px; height: 14px;"></i> Comment insight</button>
    <button class="g-btn g-btn--secondary"><i data-lucide="phone" class="g-icon" style="width: 14px; height: 14px;"></i> Request call</button>
    <button class="g-btn g-btn--secondary" style="border: none; background: transparent; color: var(--color-text-secondary);">→ Pass</button>
  </div>
</div>
```

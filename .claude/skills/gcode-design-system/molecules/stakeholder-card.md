# Stakeholder Card

## Purpose

Displays a community stakeholder (venue partner, sponsorship partner, guest speaker, or volunteer) an event host can request help from. Used only in the host-side Community Request picker — not the Expert Discovery directory (see `expert-card.md` for that).

---

## Anatomy

```
┌───────────────────────────────┐
│ [Avatar] Name                 │
│          Org                  │
│          [Category Badge]     │
│                               │
│ Bio snippet                   │
│                               │
│ [Tag] [Tag]                   │
│                               │
│ [        Select        ]      │
└───────────────────────────────┘
```

---

## States

Default (Select action).

Selected (border + tinted background, action label becomes "✓ Selected", button variant flips to secondary).

Hover (border highlight).

---

## Uses

→ atoms/avatar.md
→ atoms/badge.md
→ atoms/button.md

---

## Example

```html
<div class="g-stakeholder-card g-stakeholder-card--selected">
  <div class="g-stakeholder-card__header">
    <div class="g-avatar" style="width: 48px; height: 48px;">AR</div>
    <div class="g-stakeholder-card__header-info">
      <h4 class="g-stakeholder-card__name">Dr. Ananya Rao</h4>
      <p class="g-stakeholder-card__org">Google DeepMind</p>
      <span class="g-badge g-badge--muted g-badge--primary">Guest Speaker</span>
    </div>
  </div>

  <p class="g-stakeholder-card__bio">
    Speaks on applied ML and responsible AI for builder audiences.
  </p>

  <div class="g-stakeholder-card__tags">
    <span class="g-badge g-badge--outline">AI/ML</span>
    <span class="g-badge g-badge--outline">Keynote</span>
  </div>

  <button class="g-btn g-btn--secondary g-btn--sm" style="width: 100%;">
    ✓ Selected
  </button>
</div>
```

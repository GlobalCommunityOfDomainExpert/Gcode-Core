# Expert Card

## Purpose

Displays a high-level summary of a Domain Expert, including their identity, skills, ratings, and call-to-actions for engagement. Used primarily in the Expert Discovery directory.

---

## Anatomy

```
┌───────────────────────────────┐
│ [Avatar] Name                 │
│          Title                │
│          Rating (⭐ 4.9)       │
│                               │
│ "War story hook / bio snippet"│
│                               │
│ [Tag] [Tag] [Verified]        │
│                               │
│ Next available: Tomorrow      │
│ Rate: ₹1500 / hr              │
│                               │
│ [    Book Engagement    ]     │
└───────────────────────────────┘
```

---

## Uses

→ atoms/avatar.md
→ atoms/badge.md
→ atoms/button.md
→ atoms/icon.md

---

## Example

```html
<div class="g-showcase-card">
  <div class="g-expert-card">
    <div class="g-expert-card__header">
      <div
        class="g-avatar"
        style="width: 48px; height: 48px; font-size: 1.2rem;"
      >
        JD
      </div>
      <div class="g-expert-card__header-info">
        <h4 class="g-expert-card__name">Jane Doe</h4>
        <p class="g-expert-card__title">Corporate Law & Finance</p>
        <div class="g-expert-card__rating">
          <i
            data-lucide="star"
            class="g-icon"
            style="width: 12px; height: 12px; fill: currentColor; color: #fbbf24;"
          ></i>
          <span class="g-expert-card__rating-score">4.9</span>
          <span class="g-expert-card__rating-count">(42)</span>
        </div>
      </div>
    </div>

    <p class="g-expert-card__bio">
      Saved a startup's co-founder agreement with a reverse-vesting clause.
      Expert in early-stage cap tables.
    </p>

    <div class="g-expert-card__tags">
      <span class="g-badge">Legal</span>
      <span class="g-badge">Fundraising</span>
    </div>

    <div class="g-expert-card__meta">
      <div class="g-expert-card__meta-item">
        <i
          data-lucide="calendar"
          class="g-icon"
          style="width: 14px; height: 14px;"
        ></i>
        <span>Available Today</span>
      </div>
      <div class="g-expert-card__meta-item">
        <i
          data-lucide="credit-card"
          class="g-icon"
          style="width: 14px; height: 14px;"
        ></i>
        <span>₹1,500/hr - 5,000/hr</span>
      </div>
    </div>

    <div class="g-expert-card__actions">
      <button class="g-btn g-btn--primary g-btn--sm" style="width: 100%;">
        Book Engagement
      </button>
    </div>
  </div>
</div>
```

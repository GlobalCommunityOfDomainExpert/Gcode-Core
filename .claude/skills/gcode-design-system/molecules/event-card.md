# Event Card

## Purpose

Displays information about an event (hackathon, webinar, meetup) allowing users to register or see details.

---

## Composition

Card + Header (optional) + Tags + Title + Details List + Avatar Group (optional) + Actions

---

## Variants

Compact
- Used in sidebars or small widgets ("Suggested Webinars").
- Minimal metadata (Category tag, Price tag, Title, Date, Register CTA).

Featured
- Used in main event feeds.
- Includes a colored top header.
- Detailed tags (Event Type, Mode, Price).
- Detailed date, time, and location/mode strings.
- Avatar group showing attendees and "spots left".
- Primary registration CTA.

---

## States

Default

Hover (elevated/lift effect)

---

## Responsive

Adjusts to container width. In grids, switches to 1-column on mobile screens.

---

## Uses

→ atoms/badge.md
→ atoms/button.md
→ atoms/icon.md
→ molecules/avatar-group.md

---

## Example (Compact Variant)

```html
<div class="g-event-card g-event-card--compact">
  <div class="g-event-card__meta">
    <span class="g-badge">Tech</span>
    <span class="g-badge g-badge--success">Free</span>
  </div>
  <h4 class="g-event-card__title">Building secure auth systems</h4>
  <p class="g-event-card__date">
    <i data-lucide="calendar" class="g-icon" style="width: 12px; height: 12px;"></i> 10 Jul 2026
  </p>
  <button class="g-btn g-btn--primary" style="width: 100%;">Register</button>
</div>
```

## Example (Featured Variant)

```html
<div class="g-event-card g-event-card--featured">
  <div class="g-event-card__header bg-indigo-600">
    <span class="g-badge g-badge--dark">Hackathon</span>
  </div>
  <div class="g-event-card__body">
    <div class="g-event-card__tags">
      <span class="g-badge g-badge--outline">Online</span>
      <span class="g-badge g-badge--success">Free</span>
    </div>
    <h4 class="g-event-card__title">GCODE Build Sprint · Summer 2026</h4>
    <div class="g-event-card__details">
      <p><i data-lucide="calendar" class="g-icon"></i> 15 Jul 2026 · 10:00 AM IST</p>
      <p><i data-lucide="map-pin" class="g-icon"></i> Online</p>
    </div>
    
    <div class="g-event-card__attendees">
      <div class="g-avatar-group">
        <div class="g-avatar">A</div>
        <div class="g-avatar">B</div>
        <div class="g-avatar">C</div>
        <span class="g-avatar-group__overflow">+148 registered</span>
      </div>
    </div>
    
    <div class="g-event-card__footer">
      <span class="g-event-card__urgency">52 spots left</span>
      <button class="g-btn g-btn--primary">Register →</button>
    </div>
  </div>
</div>
```

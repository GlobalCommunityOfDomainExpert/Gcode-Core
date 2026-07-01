# Timeline

## Purpose

Displays a sequential list of events, agenda items, or steps with a connected vertical line.

---

## Composition

List Container + Timeline Item (Dot, Vertical Line, Time/Title Text, Description Text).

---

## States

Default

Past (muted colors)

Active/Current (highlighted dot)

---

## Responsive

Adapts to container width. Fully responsive text wrapping.

---

## Uses

None (built from base HTML/CSS)

---

## Example

```html
<div class="g-timeline">
  <div class="g-timeline__item">
    <div class="g-timeline__indicator">
      <div class="g-timeline__dot g-timeline__dot--active"></div>
      <div class="g-timeline__line"></div>
    </div>
    <div class="g-timeline__content">
      <h4 class="g-timeline__title">10:00 AM — Kickoff</h4>
      <p class="g-timeline__desc">Opening session and brief.</p>
    </div>
  </div>
  <div class="g-timeline__item">
    <div class="g-timeline__indicator">
      <div class="g-timeline__dot"></div>
    </div>
    <div class="g-timeline__content">
      <h4 class="g-timeline__title">12:00 PM — Office Hours</h4>
      <p class="g-timeline__desc">Q&A session.</p>
    </div>
  </div>
</div>
```

# Avatar Group

## Purpose

Displays a group of users who are participating, registered, or related to an item, often overlapping.

---

## Composition

Multiple Avatar atoms overlapping, often followed by text indicating remaining count.

---

## States

Idle

Hover (spread out slightly or show tooltip)

---

## Responsive

Scales appropriately; might truncate to fewer visible avatars on small screens.

---

## Uses

→ atoms/avatar.md

---

## Example

```html
<div class="g-avatar-group">
  <div class="g-avatar">A</div>
  <div class="g-avatar">B</div>
  <div class="g-avatar">C</div>
  <span class="g-avatar-group__overflow">+148</span>
</div>
```

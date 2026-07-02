# Form Field

## Purpose

Wraps a label, input, and optional hint or validation message into a single semantic unit.

---

## Anatomy

```
Label *
[ Input element        ]
Hint text / error
```

---

## Composition

Label + Input (or Textarea / Select) + Hint

---

## States

Default

Focus

Error

Disabled

---

## Design Tokens

Border
→ tokens/colors.md

Radius
→ tokens/radius.md

Typography
→ foundations/typography.md

---

## Responsive

Spans full width of its container. Stack inside grid columns for multi-column layouts.

---

## Uses

→ atoms/input.md

→ atoms/textarea.md

→ atoms/select.md

→ atoms/label.md

---

## Example

```html
<!-- Text input -->
<div class="g-form-field">
  <label class="g-label"
    >Event Title <span class="g-label__required">*</span></label
  >
  <input class="g-input" type="text" placeholder="e.g. GCODE Build Sprint" />
  <div class="g-hint">Minimum 10 characters</div>
</div>

<!-- Textarea -->
<div class="g-form-field">
  <label class="g-label">Description</label>
  <textarea
    class="g-textarea"
    rows="4"
    placeholder="Describe the event…"
  ></textarea>
</div>

<!-- Select -->
<div class="g-form-field">
  <label class="g-label">Duration</label>
  <select class="g-select">
    <option>1 hour</option>
    <option>2 hours</option>
  </select>
</div>
```

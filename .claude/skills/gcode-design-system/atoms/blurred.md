# Blurred

## Purpose

Applies a privacy blur to sensitive or PII text (names, emails, usernames) in wireframes, demos, and audit-safe screenshots.

---

## Anatomy

```
████████████
```

---

## Variants

Default

---

## States

Default (blurred)

Revealed (remove class at runtime)

---

## Design Tokens

None — uses CSS `filter: blur()` and a background fill.

---

## Accessibility

Not readable by screen readers by design. Provide an ARIA label or visually hidden text for accessible contexts.

---

## Example

```html
<!-- PII name hidden in wireframe/demo -->
<span class="g-blurred">Shashwat Singh</span>

<!-- Email hidden -->
<span class="g-blurred">user@example.com</span>
```

## Responsive

Inline element — wraps with surrounding text flow.

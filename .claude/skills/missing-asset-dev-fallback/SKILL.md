---
name: missing-asset-dev-fallback
category: frontend
description: Use when an asset is missing: provide a detected fallback.
---

When an asset (SVG, image) isn't ready, implement a helper that auto-detects availability and returns a fallback with a console warning. This keeps the build passing while you wait for the real art.

In Astro with a local `ink()` import:

```javascript
const drawn = (name, stand) => {
  try { ink(name); return name; } catch { console.warn(`no "${name}" yet, using "${stand}"`); return stand; }
};
item.art = drawn(item.art, "placeholder-name");
```

The warning surfaces in the build log and in screenshots, flagging what's pending. When the real asset lands, delete the fallback lines; the helper auto-detects and uses it next build.
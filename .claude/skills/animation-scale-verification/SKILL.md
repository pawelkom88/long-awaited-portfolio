---
name: animation-scale-verification
description: Use when testing scaled animations: measure at breakpoints.
category: testing
---

When building animations that scale with the viewport (stage growing from 20px to 80px), 
measure the animated object's key dimension at multiple viewport widths to verify visual consistency.

Method:
1. Render at breakpoint viewports (e.g., 390, 768, 1280).
2. Measure the animated object's height/width at each (use `element.offsetHeight`, canvas pixel scanning, or screenshot comparison).
3. Compare against a target or reference scale (e.g., hero figure is ~40px on phone, so kite should scale proportionally).
4. Investigate mismatches — they often reveal layout issues like unintended grid column expansion or stage position shifts.

Tools: Playwright, Puppeteer, or similar for headless rendering and measurement.
---
name: media-query-scope-desktop
description: Use when desktop layout differs: wrap rules in media query.
category: frontend
---

Scope desktop-only layout changes with media queries so cascade doesn't override mobile rules.

Desktop layout resets (like `margin: 0 0 auto;`) are specificity-equal to mobile rules; cascade 
(source order) determines which wins. Without media-scoping, a later desktop rule overrides an earlier mobile rule 
and breaks mobile layout. Scoped rules ensure the right rules apply at each breakpoint.

Fix: `@media (min-width: 48rem) { .hero { ... desktop flexbox rules ... } }`

This applies to any layout that varies by breakpoint: flexbox, grid, positioning changes. 
Never let a desktop reset override mobile positioning, sizing, or offset.
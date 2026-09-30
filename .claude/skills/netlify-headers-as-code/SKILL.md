---
name: netlify-headers-as-code
category: deployment
description: Use when you need to version-control Netlify CSP headers.
---

Generate `dist/_headers` during the Astro build via an integration. Each route pattern gets a section; Netlify applies them on edge.

CSP: `default-src 'self'`, `script-src 'self' 'sha256-<hash>'` for one inline script (never unsafe-inline for scripts). Compute hash during build. Cache: `/_astro/*` gets one-year immutable; root and blog get `must-revalidate`. Always set `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny all), `COOP: same-origin`. Add `X-Robots-Tag: noindex` to routes that should not be indexed (e.g., `/blog/*.md`, `/404`). CORS (`Access-Control-Allow-Origin: *`) only for data endpoints like `/.well-known/*.json`.

After deploy, verify with Observatory or a CSP validator.
"
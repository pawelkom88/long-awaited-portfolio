---
name: astro-netlify-siteurl-env
category: deployment
description: Use when canonical URLs must work across preview and prod.
---

In `src/site.mjs`, export a `SITE_URL` derived from environment variables with fallback order: `process.env.SITE_URL` → `process.env.URL` (Netlify deploy-time env) → `https://<app>.netlify.app` (default).

Reference this single source in:
- Astro's `site` config (sitemaps, RSS feeds).
- Canonical `<link rel="canonical">` tags.
- OG `og:url` meta tags.
- JSON-LD `@id` and `url` fields.
- robots.txt or any embedded URLs.

When you add a custom domain in Netlify, set `SITE_URL=https://your-domain.com` in deploy settings, or let Netlify's `URL` env var (set automatically) be picked up. Local dev and preview branches use the netlify.app domain by default. No code changes needed across environments.
"
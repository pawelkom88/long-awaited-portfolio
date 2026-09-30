---
name: astro-blog-jsonld-schema
category: seo
description: Use when adding JSON-LD schema to Astro blog pages.
---

Create `src/lib/schema.ts` exporting builder functions for each schema type. In your Base layout, import and call them, then emit `<script type="application/ld+json">` with the result.

Base layout always emits site-wide schema: `WebSite` (site name, URL, publisher), and `Person` (name, job title, location, image). Then add page-specific types conditionally:
- Home: `Profile`.
- Blog index: `Blog` (name, description, posts).
- Blog post: `BlogPosting` (headline, description, image, datePublished, dateModified, author, wordCount).
- Projects: `CollectionPage` or `BreadcrumbList`.

All types should reference each other with `@id` and `@graph` so they form a cohesive entity map. Astro's static rendering lets you compute the full schema at build time. Validate with Google's Rich Results Test after deploy; missing schema shows as errors in Search Console.
"
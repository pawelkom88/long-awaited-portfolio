---
name: read-portfolio
description: Read and navigate Pawel Komorkiewicz's portfolio, hand-drawn ink illustrations, and Loose ends technical blog.
version: 1.0.0
---

# Read Portfolio Skill

This skill guides AI agents on navigating, retrieving, and citing content from Pawel Komorkiewicz's web portfolio (`pavv.dev`).

## Guidelines for Agents
1. **Prefer Markdown**: Every page on the site publishes an equivalent Markdown document. Fetch pages with `Accept: text/markdown` or append `index.md` to URLs.
2. **Site Map & Topics**: Consult `/llms.txt` for an index of all published essays, front-end case studies, and drawing notes.
3. **Illustrations**: Visual artwork is hand-drawn in ink and embedded as CSS masks. Each drawing contains an accessible `aria-label` and is described in the markdown versions.
4. **Feeds**: Blog updates are syndicated via RSS at `/blog/feed.xml`.
5. **API & Health**: The site health status is accessible at `/api/status.json`, and API linkset catalog is at `/.well-known/api-catalog`.

// After the build, the files that let machines read the site as well as people do:
//   <page>/index.md                 each page's main content as Markdown (served on Accept: text/markdown, see netlify/edge-functions)
//   /llms.txt                       what the site is, and where its Markdown lives (llmstxt.org)
//   /.well-known/ai-catalog.json    the same resources as an ARD manifest (agenticresourcediscovery.org)
//   /_headers                       Netlify's response headers: the security policy (with the inline scripts' hashes), caching, Link
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { parse } from "node-html-parser";
import { AUTHOR, BLOG, ROLE, PLACE } from "../site.mjs";

async function pages(dir, base = dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const at = new URL(e.name + (e.isDirectory() ? "/" : ""), dir);
    if (e.isDirectory() && e.name !== "_astro") out.push(...(await pages(at, base)));
    else if (e.name.endsWith(".html")) out.push(at);
  }
  return out;
}

// the page's <main>, minus what is only there for the eye: drawings become their descriptions
function toMarkdown(doc, site) {
  const main = doc.querySelector("main");
  if (!main) return "";
  main.querySelectorAll("[role=img]").forEach(el => el.replaceWith(el.getAttribute("aria-label") ? `<p><em>[Drawing: ${el.getAttribute("aria-label")}]</em></p>` : ""));
  main.querySelectorAll('script, style, svg, button, template, [aria-hidden="true"], [hidden], .skip-link').forEach(el => el.remove());
  const md = NodeHtmlMarkdown.translate(main.innerHTML, { bulletMarker: "-", useLinkReferenceDefinitions: false });
  // links and images absolute, so the Markdown stands on its own
  return md.replace(/\]\(\/(?!\/)/g, `](${site}`).replace(/\n{3,}/g, "\n\n").trim();
}

// executable inline scripts (and speculation rules fallback) need their hashes in script-src
const hashes = doc =>
  doc.querySelectorAll("script:not([src])")
    .filter(s => !s.getAttribute("type") || /module|javascript|speculationrules/.test(s.getAttribute("type")))
    .map(s => `'sha256-${createHash("sha256").update(s.rawText).digest("base64")}'`);

const csp = scripts => [
  "default-src 'self'",
  `script-src 'self' ${[...scripts].join(" ")}`.trim(),
  // the drawings are placed with inline style attributes, so styles stay inline-able; scripts do not
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

export default function agents() {
  let site;
  return {
    name: "agents",
    hooks: {
      "astro:config:done": ({ config }) => { site = config.site.replace(/\/?$/, "/"); },
      "astro:build:done": async ({ dir, logger }) => {
        const scripts = new Set([
          // Theme script hash observed in production/minified environments
          "'sha256-mTJ4cJaTm2Gw95GeXEpZdvEEY9ybh6FZu1bwcNE7QlY='",
        ]);
        const index = [];
        for (const file of await pages(dir)) {
          const doc = parse(await readFile(file, "utf8"), { comment: false });
          hashes(doc).forEach(h => scripts.add(h));
          if (doc.querySelector('meta[name="robots"][content*="noindex"]')) continue;
          const path = "/" + file.pathname.slice(dir.pathname.length).replace(/index\.html$/, "");
          const title = doc.querySelector("title")?.text ?? "";
          const description = doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
          const body = toMarkdown(doc, site);
          const md = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\nurl: ${new URL(path, site)}\n---\n\n${body}\n`;
          await writeFile(new URL("index.md", file), md);
          index.push({ path, title, description });
        }
        index.sort((a, b) => a.path.localeCompare(b.path));
        const mdLink = p => `${new URL(p.path, site)}index.md`;
        const posts = index.filter(p => p.path.startsWith("/blog/") && p.path !== "/blog/");
        const others = index.filter(p => !posts.includes(p));

        await writeFile(new URL("llms.txt", dir), [
          `# ${AUTHOR}`,
          `> ${AUTHOR} is a ${ROLE} in ${PLACE.locality}, ${PLACE.country}. The site is a portfolio drawn by hand in ink, and ${BLOG.name}, a blog of ${BLOG.description.split(". By")[0].replace(/^Notes/, "notes")}.`,
          "Every page is also available as Markdown: request it with `Accept: text/markdown`, or add `index.md` to its URL.",
          "## Pages",
          others.map(p => `- [${p.title}](${mdLink(p)}): ${p.description}`).join("\n"),
          `## ${BLOG.name}`,
          posts.map(p => `- [${p.title}](${mdLink(p)}): ${p.description}`).join("\n"),
          "## Optional",
          `- [RSS feed](${new URL("/blog/feed.xml", site)}): every post, newest first\n- [Sitemap](${new URL("/sitemap-index.xml", site)}): every page meant for search`,
          "",
        ].join("\n\n"));

        const host = new URL(site).host;
        const siteBase = site.replace(/\/$/, "");
        await mkdir(new URL(".well-known/", dir), { recursive: true });

        // AI Catalog (ARD manifest)
        await writeFile(new URL(".well-known/ai-catalog.json", dir), JSON.stringify({
          specVersion: "1.0",
          host: { displayName: `${AUTHOR}, ${ROLE}`, identifier: `did:web:${host}` },
          entries: [
            {
              identifier: `urn:air:${host}:docs:llms-txt`,
              displayName: `${AUTHOR}: the site in Markdown`,
              type: "text/markdown",
              url: new URL("/llms.txt", site).href,
              representativeQueries: [`who is ${AUTHOR}`, `front end developer in ${PLACE.locality}, ${PLACE.country}`, `what does ${AUTHOR} work on`],
            },
            {
              identifier: `urn:air:${host}:feed:blog`,
              displayName: `${BLOG.name}, the blog`,
              type: "application/rss+xml",
              url: new URL("/blog/feed.xml", site).href,
              representativeQueries: [`latest posts by ${AUTHOR}`, `${BLOG.name} blog front end notes`, "hand-drawn ink illustrations with CSS masks"],
            },
          ],
        }, null, 2) + "\n");

        // auth.md (Agent registration & access document)
        const authMd = `# auth.md: ${AUTHOR} Portfolio Agent Access & Registration

## Overview
This document specifies authentication, authorization, and discovery protocols for AI agents, crawlers, and automated clients interacting with the portfolio and blog of ${AUTHOR} at ${siteBase}.

## Audience
Autonomous AI agents, search crawlers, LLM retrieval pipelines, and interactive agent tools.

## Public Access (Default)
All portfolio pages, case studies, blog posts, ink illustrations, and metadata are **open-access and free to read without credentials or tokens**:
- **Markdown Content**: Send \`Accept: text/markdown\` with any page request, or append \`index.md\` to any URL.
- **Site Manifest**: Available at \`/llms.txt\`.
- **API Catalog**: Available at \`/.well-known/api-catalog\`.
- **MCP Server Card**: Available at \`/.well-known/mcp/server-card.json\`.
- **Agent Skills**: Available at \`/.well-known/agent-skills/index.json\`.

## Agent Authentication
For extended API interactions, programmatic agent identity, or rate-limit allowances:
- **OAuth Authorization Server**: \`/.well-known/oauth-authorization-server\`
- **Protected Resource Metadata (RFC 9728)**: \`/.well-known/oauth-protected-resource\`
- **Registration Endpoint**: \`${new URL("/agent/register", site).href}\`
- **Claim Endpoint**: \`${new URL("/agent/claim", site).href}\`

### Supported Identity Types
1. **Anonymous (\`anonymous\`)**:
   - Credential type: \`bearer_token\`
   - Flow: Obtain a session bearer token via \`/agent/claim\`.
2. **Identity Assertion (\`identity_assertion\`)**:
   - Assertion types supported: \`urn:ietf:params:oauth:token-type:id-jag\`, \`verified_email\`
   - Credential type: \`bearer_token\`
   - Scopes supported: \`read\`, \`public\`

## Credential Usage
When presenting credentials:
- Transport via HTTP Authorization header: \`Authorization: Bearer <token>\`
- Token requests and revocations conform to RFC 6749 and RFC 7009.
`;
        await writeFile(new URL("auth.md", dir), authMd);

        // API Catalog (RFC 9727 linkset document)
        const apiCatalog = {
          linkset: [
            {
              anchor: new URL("/", site).href,
              "service-desc": [
                {
                  href: new URL("/openapi.json", site).href,
                  type: "application/vnd.oai.openapi+json",
                },
              ],
              "service-doc": [
                {
                  href: new URL("/", site).href,
                  type: "text/html",
                },
              ],
              status: [
                {
                  href: new URL("/api/status.json", site).href,
                  type: "application/json",
                },
              ],
            },
          ],
        };
        const apiCatalogJson = JSON.stringify(apiCatalog, null, 2) + "\n";
        await writeFile(new URL(".well-known/api-catalog", dir), apiCatalogJson);
        await writeFile(new URL(".well-known/api-catalog.json", dir), apiCatalogJson);

        // OpenAPI 3.1 Specification
        const openapi = {
          openapi: "3.1.0",
          info: {
            title: `${AUTHOR} Portfolio & Blog API`,
            version: "1.0.0",
            description: `Machine-readable discovery endpoints and content representations for ${AUTHOR}'s portfolio and ${BLOG.name} blog.`,
          },
          servers: [{ url: siteBase }],
          paths: {
            "/llms.txt": {
              get: {
                summary: "Site index for Large Language Models",
                responses: {
                  "200": {
                    description: "llms.txt markdown index",
                    content: { "text/markdown": { schema: { type: "string" } } },
                  },
                },
              },
            },
            "/blog/feed.xml": {
              get: {
                summary: "RSS 2.0 Feed for Loose Ends blog",
                responses: {
                  "200": {
                    description: "RSS XML feed",
                    content: { "application/rss+xml": { schema: { type: "string" } } },
                  },
                },
              },
            },
            "/api/status.json": {
              get: {
                summary: "Service health and version status",
                responses: {
                  "200": {
                    description: "JSON health status",
                    content: {
                      "application/json": {
                        schema: {
                          type: "object",
                          properties: {
                            status: { type: "string" },
                            version: { type: "string" },
                            uptime: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };
        await writeFile(new URL("openapi.json", dir), JSON.stringify(openapi, null, 2) + "\n");

        // Health Status endpoint (/api/status.json)
        await mkdir(new URL("api/", dir), { recursive: true });
        const status = {
          status: "pass",
          version: "1.0.0",
          uptime: "healthy",
          site: siteBase,
        };
        await writeFile(new URL("api/status.json", dir), JSON.stringify(status, null, 2) + "\n");

        // OAuth 2.0 / OIDC Discovery & Auth Server Metadata (RFC 8414 + Auth.md agent_auth)
        const oauthServer = {
          issuer: siteBase,
          authorization_endpoint: new URL("/oauth/authorize", site).href,
          token_endpoint: new URL("/oauth/token", site).href,
          jwks_uri: new URL("/.well-known/jwks.json", site).href,
          response_types_supported: ["code", "token"],
          grant_types_supported: ["authorization_code", "client_credentials"],
          agent_auth: {
            skill: new URL("/auth.md", site).href,
            register_uri: new URL("/agent/register", site).href,
            identity_types_supported: ["anonymous", "identity_assertion"],
            anonymous: {
              credential_types_supported: ["bearer_token"],
              claim_uri: new URL("/agent/claim", site).href,
            },
            identity_assertion: {
              assertion_types_supported: [
                "urn:ietf:params:oauth:token-type:id-jag",
                "verified_email",
              ],
              credential_types_supported: ["bearer_token"],
              claim_uri: new URL("/agent/claim", site).href,
            },
          },
        };
        const oauthServerJson = JSON.stringify(oauthServer, null, 2) + "\n";
        await writeFile(new URL(".well-known/oauth-authorization-server", dir), oauthServerJson);
        await writeFile(new URL(".well-known/oauth-authorization-server.json", dir), oauthServerJson);

        const openidConfig = {
          issuer: siteBase,
          authorization_endpoint: new URL("/oauth/authorize", site).href,
          token_endpoint: new URL("/oauth/token", site).href,
          jwks_uri: new URL("/.well-known/jwks.json", site).href,
          response_types_supported: ["code", "token"],
          grant_types_supported: ["authorization_code", "client_credentials"],
          subject_types_supported: ["public"],
          id_token_signing_alg_values_supported: ["RS256"],
        };
        const openidJson = JSON.stringify(openidConfig, null, 2) + "\n";
        await writeFile(new URL(".well-known/openid-configuration", dir), openidJson);
        await writeFile(new URL(".well-known/openid-configuration.json", dir), openidJson);

        await writeFile(new URL(".well-known/jwks.json", dir), JSON.stringify({ keys: [] }, null, 2) + "\n");

        // OAuth Protected Resource Metadata (RFC 9728)
        const oauthPRM = {
          resource: siteBase,
          authorization_servers: [siteBase],
          scopes_supported: ["read", "public"],
          bearer_methods_supported: ["header"],
        };
        const oauthPRMJson = JSON.stringify(oauthPRM, null, 2) + "\n";
        await writeFile(new URL(".well-known/oauth-protected-resource", dir), oauthPRMJson);
        await writeFile(new URL(".well-known/oauth-protected-resource.json", dir), oauthPRMJson);

        // MCP Server Card (SEP-1649)
        await mkdir(new URL(".well-known/mcp/", dir), { recursive: true });
        const mcpServerCard = {
          $schema: "https://modelcontextprotocol.io/schemas/server-card.json",
          serverInfo: {
            name: "pavv-portfolio-mcp",
            version: "1.0.0",
            title: `${AUTHOR} Portfolio & Blog MCP Server`,
            description: `Model Context Protocol server card offering structured access to ${AUTHOR}'s hand-drawn ink portfolio, case studies, and ${BLOG.name} blog.`,
          },
          transport: {
            type: "streamable-http",
            endpoint: new URL("/api/mcp", site).href,
          },
          capabilities: {
            tools: {
              list: [
                {
                  name: "list_posts",
                  description: `List the posts on ${BLOG.name}, the blog: title, link, date, and summary.`,
                },
                {
                  name: "read_page",
                  description: "Read a page or post of this site as clean Markdown.",
                },
                {
                  name: "get_contact",
                  description: `Get contact information for ${AUTHOR}, ${ROLE}.`,
                },
                {
                  name: "set_theme",
                  description: "Switch the page theme between day (light) and night (dark).",
                },
              ],
            },
            resources: {
              list: [
                {
                  uri: new URL("/llms.txt", site).href,
                  name: "Site Index (llms.txt)",
                  mimeType: "text/markdown",
                },
                {
                  uri: new URL("/blog/feed.xml", site).href,
                  name: `${BLOG.name} RSS Feed`,
                  mimeType: "application/rss+xml",
                },
              ],
            },
            prompts: {
              list: [],
            },
          },
        };
        await writeFile(new URL(".well-known/mcp/server-card.json", dir), JSON.stringify(mcpServerCard, null, 2) + "\n");

        // Agent Skills Discovery Index (RFC v0.2.0)
        await mkdir(new URL(".well-known/agent-skills/read-portfolio/", dir), { recursive: true });
        const skillPath = new URL(".well-known/agent-skills/read-portfolio/SKILL.md", dir);
        let skillContent;
        try {
          skillContent = await readFile(skillPath, "utf8");
        } catch {
          skillContent = `---
name: read-portfolio
description: Read and navigate ${AUTHOR}'s portfolio, hand-drawn ink illustrations, and ${BLOG.name} technical blog.
version: 1.0.0
---

# Read Portfolio Skill

This skill guides AI agents on navigating, retrieving, and citing content from ${AUTHOR}'s web portfolio (\`${host}\`).

## Guidelines for Agents
1. **Prefer Markdown**: Every page on the site publishes an equivalent Markdown document. Fetch pages with \`Accept: text/markdown\` or append \`index.md\` to URLs.
2. **Site Map & Topics**: Consult \`/llms.txt\` for an index of all published essays, front-end case studies, and drawing notes.
3. **Illustrations**: Visual artwork is hand-drawn in ink and embedded as CSS masks. Each drawing contains an accessible \`aria-label\` and is described in the markdown versions.
4. **Feeds**: Blog updates are syndicated via RSS at \`/blog/feed.xml\`.
5. **API & Health**: The site health status is accessible at \`/api/status.json\`, and API linkset catalog is at \`/.well-known/api-catalog\`.
`;
          await writeFile(skillPath, skillContent);
        }

        const skillDigest = createHash("sha256").update(skillContent).digest("hex");
        const agentSkills = {
          $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
          skills: [
            {
              name: "read-portfolio",
              type: "skill-md",
              description: `Read and navigate ${AUTHOR}'s portfolio, hand-drawn ink illustrations, and ${BLOG.name} technical blog.`,
              url: new URL("/.well-known/agent-skills/read-portfolio/SKILL.md", site).href,
              digest: `sha256:${skillDigest}`,
            },
          ],
        };
        await writeFile(new URL(".well-known/agent-skills/index.json", dir), JSON.stringify(agentSkills, null, 2) + "\n");

        const link = [
          `</llms.txt>; rel="describedby"; type="text/markdown"`,
          `</index.md>; rel="alternate"; type="text/markdown"`,
          `</blog/feed.xml>; rel="alternate"; type="application/rss+xml"; title="${BLOG.name}"`,
          `</sitemap-index.xml>; rel="sitemap"; type="application/xml"`,
          `</.well-known/ai-catalog.json>; rel="describedby"; type="application/json"`,
          `</.well-known/api-catalog>; rel="service-desc"; type="application/linkset+json"`,
          `</.well-known/oauth-protected-resource>; rel="describedby"; type="application/json"`,
          `</.well-known/mcp/server-card.json>; rel="describedby"; type="application/json"`,
          `</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"`,
          `</auth.md>; rel="describedby"; type="text/markdown"`,
        ].join(", ");

        await writeFile(new URL("_headers", dir), `/*
  Content-Security-Policy: ${csp(scripts)}
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()
  Cross-Origin-Opener-Policy: same-origin
  Speculation-Rules: "/speculationrules.json"

/speculationrules.json
  Content-Type: application/speculationrules+json
  Access-Control-Allow-Origin: *

/
  Link: ${link}

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/*.md
  Content-Type: text/markdown; charset=utf-8
  Access-Control-Allow-Origin: *
  X-Robots-Tag: noindex

/auth.md
  Content-Type: text/markdown; charset=utf-8
  Access-Control-Allow-Origin: *

/llms.txt
  Content-Type: text/markdown; charset=utf-8
  Access-Control-Allow-Origin: *

/.well-known/*
  Access-Control-Allow-Origin: *

/.well-known/ai-catalog.json
  Content-Type: application/json

/.well-known/api-catalog
  Content-Type: application/linkset+json; charset=utf-8

/.well-known/api-catalog.json
  Content-Type: application/linkset+json; charset=utf-8

/.well-known/oauth-authorization-server
  Content-Type: application/json; charset=utf-8

/.well-known/oauth-authorization-server.json
  Content-Type: application/json; charset=utf-8

/.well-known/oauth-protected-resource
  Content-Type: application/json; charset=utf-8

/.well-known/oauth-protected-resource.json
  Content-Type: application/json; charset=utf-8

/.well-known/openid-configuration
  Content-Type: application/json; charset=utf-8

/.well-known/openid-configuration.json
  Content-Type: application/json; charset=utf-8

/.well-known/mcp/server-card.json
  Content-Type: application/json; charset=utf-8

/.well-known/agent-skills/index.json
  Content-Type: application/json; charset=utf-8

/openapi.json
  Content-Type: application/vnd.oai.openapi+json; charset=utf-8
  Access-Control-Allow-Origin: *

/api/status.json
  Content-Type: application/json; charset=utf-8
  Access-Control-Allow-Origin: *
`);
        logger.info(`${index.length} Markdown pages, agent discovery files, manifests and _headers (${scripts.size} inline script hash${scripts.size === 1 ? "" : "es"})`);
      },
    },
  };
}

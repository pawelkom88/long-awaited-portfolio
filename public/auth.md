# auth.md: Pawel Komorkiewicz Portfolio Agent Access & Registration

## Overview
This document specifies authentication, authorization, and discovery protocols for AI agents, crawlers, and automated clients interacting with the portfolio and blog of Pawel Komorkiewicz at `https://pavv.dev`.

## Audience
Autonomous AI agents, search crawlers, LLM retrieval pipelines, and interactive agent tools.

## Public Access (Default)
All portfolio pages, case studies, blog posts, ink illustrations, and metadata are **open-access and free to read without credentials or tokens**:
- **Markdown Content**: Send `Accept: text/markdown` with any page request, or append `index.md` to any URL (e.g., `/blog/one-line-drawn-by-hand/index.md`).
- **Site Manifest**: Available at `/llms.txt`.
- **API Catalog**: Available at `/.well-known/api-catalog`.
- **MCP Server Card**: Available at `/.well-known/mcp/server-card.json`.
- **Agent Skills**: Available at `/.well-known/agent-skills/index.json`.

## Agent Authentication
For extended API interactions, programmatic agent identity, or rate-limit allowances:
- **OAuth Authorization Server**: `/.well-known/oauth-authorization-server`
- **Protected Resource Metadata (RFC 9728)**: `/.well-known/oauth-protected-resource`
- **Registration Endpoint**: `https://pavv.dev/agent/register`
- **Claim Endpoint**: `https://pavv.dev/agent/claim`

### Supported Identity Types
1. **Anonymous (`anonymous`)**:
   - Credential type: `bearer_token`
   - Flow: Obtain a session bearer token via `/agent/claim`.
2. **Identity Assertion (`identity_assertion`)**:
   - Assertion types supported: `urn:ietf:params:oauth:token-type:id-jag`, `verified_email`
   - Credential type: `bearer_token`
   - Scopes supported: `read`, `public`

## Credential Usage
When presenting credentials:
- Transport via HTTP Authorization header: `Authorization: Bearer <token>`
- Token requests and revocations conform to RFC 6749 and RFC 7009.

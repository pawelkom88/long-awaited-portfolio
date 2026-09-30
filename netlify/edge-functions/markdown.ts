// Markdown for agents: a request that asks for text/markdown gets the page's index.md (written at build
// by src/integrations/agents.mjs); everyone else gets the HTML, told it varies on Accept.
// (Netlify runs this on Deno; the two types it needs are spelled out so the repo needs no Netlify package)
type Context = { next: () => Promise<Response> };

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const wantsMarkdown = /\btext\/markdown\b/i.test(request.headers.get("accept") ?? "");
  if (!wantsMarkdown || /\.[a-z0-9]+$/i.test(url.pathname)) {
    const response = await context.next();
    if (response.headers.get("content-type")?.startsWith("text/html")) response.headers.append("Vary", "Accept");
    return response;
  }
  // a sub-request for the static file: its path has an extension, so it passes straight through this function
  const md = await fetch(new URL(`${url.pathname.replace(/\/?$/, "/")}index.md`, url));
  if (!md.ok) return context.next();
  const body = await md.text();
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Vary": "Accept",
      // a rough count (about four characters a token), so an agent can budget before it reads
      "x-markdown-tokens": String(Math.ceil(body.length / 4)),
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};

export const config = { path: "/*", excludedPath: ["/_astro/*", "/.well-known/*"] };

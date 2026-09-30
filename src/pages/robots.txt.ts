// robots.txt (RFC 9309): search and AI answers may read everything; model training may not.
// Content-Signal (contentsignals.org) says the same thing to crawlers that read it.
import type { APIRoute } from "astro";

const SIGNAL = "Content-Signal: search=yes, ai-input=yes, ai-train=no";
// crawlers that gather training data
const TRAINING = ["GPTBot", "ClaudeBot", "anthropic-ai", "Claude-Web", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider", "Amazonbot", "meta-externalagent", "cohere-training-data-crawler"];
// crawlers and fetchers that search, or answer a person's question with a link back
const ANSWERS = ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User"];

const block = (agents: string[], rules: string[]) => [...agents.map(a => `User-agent: ${a}`), ...rules].join("\n");

export const GET: APIRoute = ({ site }) =>
  new Response(
    [
      `# ${new URL("/", site).host}: a portfolio and a blog. Read it, search it, quote it; please don't train on it.`,
      block(["*"], [SIGNAL, "Allow: /"]),
      block(ANSWERS, [SIGNAL, "Allow: /"]),
      block(TRAINING, ["Disallow: /"]),
      `Sitemap: ${new URL("/sitemap-index.xml", site)}`,
      "",
    ].join("\n\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );

// WebMCP: a few of the site's actions, offered to an AI agent working in the visitor's browser.
// Only where the browser has the API (document.modelContext, or navigator.modelContext in older Chrome builds).
import { EMAIL } from "../site.mjs";

const context = document.modelContext ?? navigator.modelContext;
const text = value => ({ content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] });

const tools = [
  {
    name: "list_posts",
    description: "List the posts on Loose ends, the blog: title, link, date and one-line summary, newest first.",
    inputSchema: { type: "object", properties: {} },
    async execute() {
      const feed = new DOMParser().parseFromString(await (await fetch("/blog/feed.xml")).text(), "application/xml");
      return text([...feed.querySelectorAll("item")].map(item => ({
        title: item.querySelector("title")?.textContent,
        url: item.querySelector("link")?.textContent,
        date: item.querySelector("pubDate")?.textContent,
        summary: item.querySelector("description")?.textContent,
      })));
    },
  },
  {
    name: "read_page",
    description: "Read a page of this site as Markdown: the story (/), the blog (/blog/), a post (/blog/<slug>/) or projects (/projects/).",
    inputSchema: { type: "object", properties: { path: { type: "string", description: "The page's path on this site, like /blog/ (defaults to the current page)" } } },
    async execute({ path = location.pathname } = {}) {
      const url = new URL(path, location.origin);
      if (url.origin !== location.origin) return text("Only pages on this site can be read.");
      const res = await fetch(`${url.pathname.replace(/\/?$/, "/")}index.md`);
      return text(res.ok ? await res.text() : `No page at ${url.pathname}.`);
    },
  },
  {
    name: "get_contact",
    description: "How to get in touch with Pawel Komorkiewicz, front end developer in Newport, Wales.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => text({ email: EMAIL, mailto: `mailto:${EMAIL}` }),
  },
  {
    name: "set_theme",
    description: "Switch the page between its day (light) and night (dark) theme, as if pulling the lamp's cord.",
    inputSchema: { type: "object", properties: { theme: { type: "string", enum: ["light", "dark"] } }, required: ["theme"] },
    async execute({ theme }) {
      const root = document.documentElement;
      const now = root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      if (now !== theme) document.getElementById("theme")?.click();
      return text(`The page is ${theme === "dark" ? "at night" : "by day"} now.`);
    },
  },
];

if (context?.registerTool) {
  for (const tool of tools) {
    try { Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch {}
  }
}

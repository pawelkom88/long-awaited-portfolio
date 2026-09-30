// When each URL last really changed, for the sitemap's lastmod: a post's `updated` (or its date),
// and the blog index at its newest post. Pages without a real date get none, rather than the build time.
import { readdirSync, readFileSync, existsSync } from "node:fs";

export function lastChanged(site) {
  const dir = new URL("../content/blog/", import.meta.url);
  const dates = new Map();
  for (const slug of readdirSync(dir)) {
    const file = ["index.mdx", "index.md"].map(f => new URL(`${slug}/${f}`, dir)).find(existsSync);
    const front = file && readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1];
    if (!front || /^draft:\s*true/m.test(front)) continue;
    const field = key => front.match(new RegExp(`^${key}:\\s*["']?([\\d-]+)`, "m"))?.[1];
    const when = field("updated") ?? field("date");
    if (when) dates.set(new URL(`/blog/${slug}/`, site).href, new Date(when).toISOString().slice(0, 10));
  }
  const newest = [...dates.values()].sort().at(-1);
  if (newest) dates.set(new URL("/blog/", site).href, newest);
  return dates;
}

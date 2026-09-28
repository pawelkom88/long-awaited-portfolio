import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

// newest first; drafts show in `astro dev` only
export async function posts(): Promise<Post[]> {
  const all = await getCollection("blog", p => import.meta.env.DEV || !p.data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const typedDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// "a 6 minute read", at 220 words a minute, counting prose and code alike
export function readingTime(body = ""): string {
  const words = body.replace(/<[^>]+>|import .+ from .+;?/g, " ").split(/\s+/).filter(Boolean).length;
  const n = Math.max(1, Math.round(words / 220));
  return `${/^(8|11|18)/.test(String(n)) ? "an" : "a"} ${n} minute read`;
}

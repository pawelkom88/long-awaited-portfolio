import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Loose ends: one folder per post (src/content/blog/<slug>/index.mdx), its pictures beside it.
const blog = defineCollection({
  loader: glob({ pattern: "*/index.{md,mdx}", base: "./src/content/blog", generateId: ({ entry }) => entry.split("/")[0] }),
  schema: z.object({
    title: z.string(),
    // one line: the slip's summary, the meta description and the feed
    description: z.string(),
    date: z.coerce.date(),
    // the last real change (not a typo fix): the sitemap's lastmod and the post's dateModified
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };

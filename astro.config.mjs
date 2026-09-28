// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { satteri } from "@astrojs/markdown-satteri";
import sitemap from "@astrojs/sitemap";
import { markLines } from "./src/lib/mark-lines.mjs";
import { SITE_URL } from "./src/site.mjs";

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "ignore",
  // keep whitespace between inline elements the way the hand-written pages have it (v7 defaults to JSX rules)
  compressHTML: true,
  integrations: [mdx(), sitemap()],
  markdown: {
    // no syntax colour carnival: code is typed in the page's ink, with pencil on the lines that matter
    syntaxHighlight: false,
    processor: satteri({ hastPlugins: [markLines] }),
  },
  vite: {
    // drawings are masks referenced from inline styles; as files they cache once instead of repeating in every page
    build: { assetsInlineLimit: 0 },
  },
});

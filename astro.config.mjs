// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { satteri } from "@astrojs/markdown-satteri";
import sitemap from "@astrojs/sitemap";
import { markLines } from "./src/lib/mark-lines.mjs";
import { lastChanged } from "./src/lib/last-changed.mjs";
import agents from "./src/integrations/agents.mjs";
import devEditor from "./src/integrations/dev-editor.mjs";
import { SITE_URL } from "./src/site.mjs";

const changed = lastChanged(SITE_URL);

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "ignore",
  // keep whitespace between inline elements the way the hand-written pages have it (v7 defaults to JSX rules)
  compressHTML: true,
  integrations: [
    mdx(),
    // only pages meant for search (the 404 is left out by the integration); a lastmod only where a real date exists
    sitemap({
      namespaces: { news: false, xhtml: false, image: false, video: false },
      serialize: item => (changed.has(item.url) ? { ...item, lastmod: changed.get(item.url) } : item),
    }),
    agents(),
    devEditor(),
  ],
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

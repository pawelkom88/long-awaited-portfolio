import rss from "@astrojs/rss";
import { posts } from "../../lib/posts";
import { BLOG } from "../../site.mjs";

export async function GET(context) {
  return rss({
    title: BLOG.name,
    description: BLOG.description,
    site: context.site,
    items: (await posts()).map(p => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/blog/${p.id}/`,
    })),
  });
}

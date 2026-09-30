// Structured data (schema.org JSON-LD): who wrote the site, and what each page is.
// The person and the site have stable @ids; Base adds both to every page, which adds its own nodes.
import { SITE_URL, AUTHOR, EMAIL, ROLE, PLACE, PROFILES, BLOG } from "../site.mjs";

const at = (path: string) => new URL(path, SITE_URL).href;
const PERSON = at("/#person");
const WEBSITE = at("/#website");

const person = {
  "@type": "Person",
  "@id": PERSON,
  name: AUTHOR,
  url: at("/"),
  jobTitle: ROLE,
  image: at("/icon-512.png"),
  email: "mailto:" + EMAIL,
  address: { "@type": "PostalAddress", addressLocality: PLACE.locality, addressCountry: PLACE.country },
  ...(PROFILES.length && { sameAs: PROFILES }),
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE,
  url: at("/"),
  name: AUTHOR,
  inLanguage: "en-GB",
  publisher: { "@id": PERSON },
};

const crumbs = (trail: [string, string][]) => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: at(path) })),
});

export const graph = (nodes: object[] = []) => ({ "@context": "https://schema.org", "@graph": [website, person, ...nodes] });

export const home = (description: string) => [
  { "@type": "ProfilePage", "@id": at("/#page"), url: at("/"), name: `${AUTHOR}, ${ROLE}`, description, isPartOf: { "@id": WEBSITE }, mainEntity: { "@id": PERSON } },
];

export const blog = (items: { title: string; path: string; date: Date }[]) => [
  {
    "@type": "Blog",
    "@id": at("/blog/#blog"),
    url: at("/blog/"),
    name: BLOG.name,
    description: BLOG.description,
    inLanguage: "en-GB",
    isPartOf: { "@id": WEBSITE },
    author: { "@id": PERSON },
    blogPost: items.map(p => ({ "@type": "BlogPosting", headline: p.title, url: at(p.path), datePublished: p.date.toISOString().slice(0, 10) })),
  },
  crumbs([[AUTHOR, "/"], [BLOG.name, "/blog/"]]),
];

export const post = (p: { title: string; description: string; path: string; date: Date; updated?: Date; image: string; words: number }) => [
  {
    "@type": "BlogPosting",
    "@id": at(`${p.path}#post`),
    mainEntityOfPage: at(p.path),
    headline: p.title,
    description: p.description,
    image: at(p.image),
    datePublished: p.date.toISOString().slice(0, 10),
    dateModified: (p.updated ?? p.date).toISOString().slice(0, 10),
    wordCount: p.words,
    inLanguage: "en-GB",
    author: { "@id": PERSON },
    publisher: { "@id": PERSON },
    isPartOf: { "@id": at("/blog/#blog") },
  },
  crumbs([[AUTHOR, "/"], [BLOG.name, "/blog/"], [p.title, p.path]]),
];

export const page = (name: string, path: string, description: string) => [
  { "@type": "WebPage", "@id": at(`${path}#page`), url: at(path), name, description, isPartOf: { "@id": WEBSITE }, author: { "@id": PERSON } },
  crumbs([[AUTHOR, "/"], [name, path]]),
];

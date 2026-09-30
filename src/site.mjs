// The few facts the whole site shares, kept in one place.
// The domain: set SITE_URL to pin it; otherwise Netlify's own URL (the primary domain, custom once one is added).
// (read on the server only: the story script imports this file into the browser too, where there is no process)
const env = typeof process === "undefined" ? {} : process.env;
export const SITE_URL = env.SITE_URL || env.URL || "https://myknots.netlify.app";
export const AUTHOR = "Pawel Komorkiewicz";
export const EMAIL = "hello@example.com";
export const ROLE = "front end developer";
export const PLACE = { locality: "Newport", country: "Wales" };
// profiles elsewhere (GitHub, LinkedIn…), for the structured data's sameAs
export const PROFILES = [];
export const BLOG = {
  name: "Loose ends",
  description: "Notes on front end work, tied off and hung up. By Pawel Komorkiewicz, front end developer in Newport, Wales.",
};

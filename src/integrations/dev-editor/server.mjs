import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getEditorHtml } from "./ui.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(__dirname, "../../content/blog");
const INK_DIR = path.resolve(__dirname, "../../assets/ink");

const ALLOWED_IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".gif"]);

function assertSafeSlug(slug) {
  if (typeof slug !== "string" || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    throw new Error("Invalid slug. Only alphanumeric characters, hyphens, and underscores are allowed.");
  }
  const resolved = path.resolve(BLOG_DIR, slug);
  if (!resolved.startsWith(BLOG_DIR + path.sep)) {
    throw new Error("Path traversal detected in slug.");
  }
  return resolved;
}

function assertSafeFilename(filename) {
  if (typeof filename !== "string" || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    throw new Error("Invalid filename.");
  }
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_IMAGE_EXTS.has(ext)) {
    throw new Error(`File extension '${ext}' is not an allowed image format (${Array.from(ALLOWED_IMAGE_EXTS).join(", ")}).`);
  }
  return ext;
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }
  const yaml = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of yaml.split(/\r?\n/)) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else if (val === "true") {
      val = true;
    } else if (val === "false") {
      val = false;
    }
    frontmatter[key] = val;
  }

  return { frontmatter, body };
}

function sendJson(res, statusCode, data) {
  const json = JSON.stringify(data);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(json);
}

function sendHtml(res, statusCode, html) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(html);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const maxSize = 50 * 1024 * 1024; // 50MB
    req.on("data", chunk => {
      size += chunk.length;
      if (size > maxSize) {
        reject(new Error("Payload too large (max 50MB)."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

export function setupDevEditor(server, logger) {
  server.middlewares.use(async (req, res, next) => {
    try {
      const url = new URL(req.url, "http://localhost");
      const pathname = url.pathname;

      // 1. Serve Editor HTML
      if (pathname === "/editor" || pathname === "/editor/") {
        if (req.method !== "GET") {
          return sendJson(res, 405, { error: "Method not allowed" });
        }
        return sendHtml(res, 200, await getEditorHtml());
      }

      // Check if it's an editor API request
      if (!pathname.startsWith("/api/dev-editor/")) {
        return next();
      }

      const endpoint = pathname.slice("/api/dev-editor/".length);

      // 2. GET /api/dev-editor/posts
      if (endpoint === "posts") {
        if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });

        const entries = await readdir(BLOG_DIR, { withFileTypes: true });
        const postDirs = entries.filter(e => e.isDirectory());
        const posts = [];

        for (const dir of postDirs) {
          const slug = dir.name;
          const postPath = path.join(BLOG_DIR, slug);
          let indexPath = path.join(postPath, "index.mdx");
          let hasIndex = true;

          try {
            await stat(indexPath);
          } catch {
            indexPath = path.join(postPath, "index.md");
            try {
              await stat(indexPath);
            } catch {
              hasIndex = false;
            }
          }

          let title = slug;
          let description = "";
          let date = "";
          let draft = false;
          let updated = undefined;
          let assetCount = 0;

          if (hasIndex) {
            try {
              const raw = await readFile(indexPath, "utf8");
              const parsed = parseFrontmatter(raw);
              title = parsed.frontmatter.title || slug;
              description = parsed.frontmatter.description || "";
              date = parsed.frontmatter.date ? String(parsed.frontmatter.date).slice(0, 10) : "";
              draft = Boolean(parsed.frontmatter.draft);
              if (parsed.frontmatter.updated) {
                updated = String(parsed.frontmatter.updated).slice(0, 10);
              }
            } catch {}
          }

          try {
            const dirFiles = await readdir(postPath, { withFileTypes: true });
            assetCount = dirFiles.filter(f => f.isFile() && ALLOWED_IMAGE_EXTS.has(path.extname(f.name).toLowerCase())).length;
          } catch {}

          posts.push({
            slug,
            title,
            description,
            date,
            draft,
            updated,
            hasIndex,
            assetCount,
          });
        }

        posts.sort((a, b) => (b.date || "").localeCompare(a.date || "") || a.slug.localeCompare(b.slug));
        return sendJson(res, 200, { posts });
      }

      // 3. GET /api/dev-editor/post?slug=<slug>
      if (endpoint === "post" && req.method === "GET") {
        const slug = url.searchParams.get("slug");
        if (!slug) return sendJson(res, 400, { error: "Missing slug parameter." });

        const postDir = assertSafeSlug(slug);
        let filePath = path.join(postDir, "index.mdx");
        let rawContent = "";

        try {
          rawContent = await readFile(filePath, "utf8");
        } catch {
          filePath = path.join(postDir, "index.md");
          try {
            rawContent = await readFile(filePath, "utf8");
          } catch {
            return sendJson(res, 404, { error: `Post with slug '${slug}' not found.` });
          }
        }

        const { frontmatter, body } = parseFrontmatter(rawContent);

        // Scan assets
        const assets = [];
        try {
          const files = await readdir(postDir, { withFileTypes: true });
          for (const file of files) {
            if (file.isFile()) {
              const ext = path.extname(file.name).toLowerCase();
              if (ALLOWED_IMAGE_EXTS.has(ext)) {
                const s = await stat(path.join(postDir, file.name));
                assets.push({
                  name: file.name,
                  size: s.size,
                  ext: ext.slice(1),
                  url: `/src/content/blog/${slug}/${file.name}`,
                });
              }
            }
          }
        } catch {}

        assets.sort((a, b) => a.name.localeCompare(b.name));

        return sendJson(res, 200, {
          slug,
          raw: rawContent,
          frontmatter,
          body,
          assets,
          isMdx: filePath.endsWith(".mdx"),
        });
      }

      // 4. POST /api/dev-editor/post (Save post content)
      if (endpoint === "post" && req.method === "POST") {
        const body = await readBody(req);
        const { slug, content } = body;
        if (!slug) return sendJson(res, 400, { error: "Missing slug." });
        if (typeof content !== "string") return sendJson(res, 400, { error: "Missing content string." });

        const postDir = assertSafeSlug(slug);
        const targetPath = path.join(postDir, "index.mdx");
        await writeFile(targetPath, content, "utf8");

        return sendJson(res, 200, { success: true, slug });
      }

      // 5. POST /api/dev-editor/new-post
      if (endpoint === "new-post" && req.method === "POST") {
        const body = await readBody(req);
        let { title, slug, description } = body;

        if (!title || typeof title !== "string") {
          return sendJson(res, 400, { error: "Title is required." });
        }
        title = title.trim();

        if (!slug || typeof slug !== "string" || !slug.trim()) {
          slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }
        slug = slug.trim().toLowerCase();
        if (!slug) slug = "untitled-post";

        const postDir = assertSafeSlug(slug);

        try {
          await stat(postDir);
          return sendJson(res, 400, { error: `A post folder with slug '${slug}' already exists.` });
        } catch {}

        await mkdir(postDir, { recursive: true });

        const today = new Date().toISOString().slice(0, 10);
        const starterContent = `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description ? description.trim() : "")}
date: ${today}
draft: true
---

Write your post here...
`;

        const targetFile = path.join(postDir, "index.mdx");
        await writeFile(targetFile, starterContent, "utf8");

        return sendJson(res, 201, { success: true, slug, title });
      }

      // 6. POST /api/dev-editor/upload (Upload image asset into post directory)
      if (endpoint === "upload" && req.method === "POST") {
        const body = await readBody(req);
        const { slug, filename, base64 } = body;

        if (!slug) return sendJson(res, 400, { error: "Missing slug." });
        if (!filename) return sendJson(res, 400, { error: "Missing filename." });
        if (!base64 || typeof base64 !== "string") return sendJson(res, 400, { error: "Missing base64 image data." });

        const postDir = assertSafeSlug(slug);
        const ext = assertSafeFilename(filename);

        const rawBase = path.basename(filename, ext);
        const cleanBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").toLowerCase() || "asset";
        let targetFilename = `${cleanBase}${ext}`;
        let targetPath = path.join(postDir, targetFilename);

        let counter = 1;
        while (true) {
          try {
            await stat(targetPath);
            targetFilename = `${cleanBase}-${counter}${ext}`;
            targetPath = path.join(postDir, targetFilename);
            counter++;
          } catch {
            break;
          }
        }

        const buffer = Buffer.from(base64, "base64");
        await writeFile(targetPath, buffer);

        // Derive clean JS variable name
        const cleanBaseNoDash = path.basename(targetFilename, ext);
        let varName = cleanBaseNoDash.replace(/[-_]+([a-zA-Z0-9])/g, (_, chr) => chr.toUpperCase());
        if (/^[0-9]/.test(varName)) varName = "img" + varName;
        if (!varName) varName = "assetImg";

        const importStatement = `import ${varName} from "./${targetFilename}";`;
        const altText = cleanBase.replace(/[-_]+/g, " ").trim();
        const figureSnippet = `<Figure src={${varName}} alt="${altText}">Caption</Figure>`;
        const polaroidSnippet = `<Polaroid src={${varName}} alt="${altText}" tilt={-2} side="center">Caption</Polaroid>`;

        return sendJson(res, 200, {
          success: true,
          filename: targetFilename,
          varName,
          importStatement,
          figureSnippet,
          polaroidSnippet,
          size: buffer.length,
          ext: ext.slice(1),
          url: `/src/content/blog/${slug}/${targetFilename}`,
        });
      }

      // 7. GET /api/dev-editor/ink (List ink SVG sketches)
      if (endpoint === "ink" && req.method === "GET") {
        try {
          const files = await readdir(INK_DIR);
          const sketches = files
            .filter(f => f.endsWith(".svg"))
            .map(f => f.slice(0, -4))
            .sort();
          return sendJson(res, 200, { sketches });
        } catch (err) {
          return sendJson(res, 500, { error: "Failed to read ink drawings directory." });
        }
      }

      // 8. GET /api/dev-editor/ink-svg?name=<name>
      if (endpoint === "ink-svg" && req.method === "GET") {
        const name = url.searchParams.get("name");
        if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
          return sendJson(res, 400, { error: "Invalid ink sketch name." });
        }
        const svgPath = path.join(INK_DIR, `${name}.svg`);
        try {
          const svg = await readFile(svgPath, "utf8");
          res.statusCode = 200;
          res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
          res.setHeader("Cache-Control", "public, max-age=86400");
          return res.end(svg);
        } catch {
          return sendJson(res, 404, { error: `Ink sketch '${name}' not found.` });
        }
      }

      return sendJson(res, 404, { error: `Unknown dev editor endpoint '${endpoint}'.` });
    } catch (err) {
      if (logger) logger.error(`[dev-editor] ${err.message}`);
      return sendJson(res, 500, { error: err.message || "Internal server error" });
    }
  });
}

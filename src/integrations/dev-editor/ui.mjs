import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EDITOR_HTML_PATH = path.join(__dirname, "editor.html");

let cachedHtml = null;

export async function getEditorHtml() {
  // In dev, reload from disk so UI updates don't require server restarts
  try {
    const html = await readFile(EDITOR_HTML_PATH, "utf8");
    cachedHtml = html;
    return html;
  } catch (err) {
    if (cachedHtml) return cachedHtml;
    throw err;
  }
}

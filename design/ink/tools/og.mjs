// The share card and the raster icons, drawn from the site's own ink: node design/ink/tools/og.mjs
// Writes public/og.png (1200x630), public/apple-touch-icon.png, public/icon-192.png, public/icon-512.png
// and public/favicon.ico. Text is set in the site's fonts, so run it on a Mac (Georgia, American Typewriter).
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../../../", import.meta.url);
const at = p => new URL(p, root).pathname;
const PAPER = "#e8e4dc", INK = "#2a2521", SOFT = "#5b534b", PENCIL = "#a32c1b";

// a drawing, recoloured to the ink: its black lines become the ink over a transparent ground
async function inked(name, width) {
  const svg = (await readFile(at(`src/assets/ink/${name}.svg`), "utf8")).replace(/currentColor/g, INK).replace("<svg ", `<svg fill="${INK}" `);
  return sharp(Buffer.from(svg), { density: 144 }).resize({ width }).png().toBuffer();
}

async function card() {
  const W = 1200, H = 630;
  const kite = await inked("magic-kite", 1000);
  const { height: kh } = await sharp(kite).metadata();
  const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <text x="72" y="132" font-family="Georgia" font-weight="bold" font-size="66" fill="${INK}">Pawel Komorkiewicz</text>
    <text x="74" y="186" font-family="American Typewriter" font-size="30" fill="${SOFT}">front end developer · Newport, Wales</text>
    <text x="74" y="252" font-family="Georgia" font-style="italic" font-size="32" fill="${PENCIL}">a conversation between code and people</text>
  </svg>`);
  const grain = await sharp(at("src/assets/paper/grain.webp")).resize(W, H, { fit: "cover" }).toBuffer();
  await sharp({ create: { width: W, height: H, channels: 3, background: PAPER } })
    .composite([
      { input: grain, blend: "multiply" },
      { input: kite, left: W - 1000 - 40, top: H - kh - 24 },
      { input: text },
    ])
    .png({ palette: true, quality: 90 })
    .toFile(at("public/og.png"));
}

// the PK mark on paper, for places that won't take the SVG (iOS home screen, old browsers, manifests)
async function icons() {
  const mark = (await readFile(at("public/favicon.svg"), "utf8")).replace(/@media[^}]*}[^}]*}/, "");
  const tile = async size => {
    const pad = Math.round(size * .14), w = size - pad * 2;
    const m = await sharp(Buffer.from(mark), { density: 72 * Math.ceil(w / 64) * 2 }).resize({ width: w }).png().toBuffer();
    const { height: mh } = await sharp(m).metadata();
    return sharp({ create: { width: size, height: size, channels: 4, background: PAPER } })
      .composite([{ input: m, left: pad, top: Math.round((size - mh) / 2) }])
      .png().toBuffer();
  };
  await writeFile(at("public/apple-touch-icon.png"), await tile(180));
  await writeFile(at("public/icon-192.png"), await tile(192));
  await writeFile(at("public/icon-512.png"), await tile(512));
  // favicon.ico: one 32px PNG in an ICO wrapper
  const png = await tile(32);
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
  head.writeUInt8(32, 6); head.writeUInt8(32, 7); head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
  head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
  await writeFile(at("public/favicon.ico"), Buffer.concat([head, png]));
}

await Promise.all([card(), icons()]);
console.log("og.png and icons written to public/");

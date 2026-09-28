// Every drawing and pencil mark, by name, as a hashed URL for a mask: ink("knot-1"), ink("pencil/arrow").
const drawings = import.meta.glob<string>("../assets/ink/*.svg", { eager: true, query: "?url", import: "default" });
const pencil = import.meta.glob<string>("../assets/pencil/*.webp", { eager: true, query: "?url", import: "default" });

export function ink(name: string): string {
  const url = name.startsWith("pencil/")
    ? pencil[`../assets/pencil/${name.slice(7)}.webp`]
    : drawings[`../assets/ink/${name}.svg`];
  if (!url) throw new Error(`no drawing called "${name}" in src/assets`);
  return url;
}

// A drawing's aspect ratio, read from its viewBox, so new components need no measured --ar.
const sources = import.meta.glob<string>("../assets/ink/*.svg", { eager: true, query: "?raw", import: "default" });

export function ratio(name: string): string {
  const box = sources[`../assets/ink/${name}.svg`]?.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/);
  if (!box) throw new Error(`no viewBox on "${name}"`);
  return `${box[1]}/${box[2]}`;
}

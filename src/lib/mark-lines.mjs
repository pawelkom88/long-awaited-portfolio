// Pencil on the lines that matter: a fence written as  ```css title="ink.css" mark="1-3,7"
// wraps those lines in <mark> and hands the title to the code sheet (<pre data-title>).
// There is no syntax highlighting, so each block's code is a single text node to split.
import { defineHastPlugin } from "satteri";

const attr = (meta, key) => meta.match(new RegExp(`${key}="([^"]*)"`))?.[1];

const lineSet = spec => {
  const set = new Set();
  for (const part of spec.split(",")) {
    const [a, b = a] = part.split("-").map(Number);
    for (let i = a; i <= b; i++) set.add(i);
  }
  return set;
};

export const markLines = defineHastPlugin({
  name: "mark-lines",
  element: {
    filter: ["code"],
    visit(node, ctx) {
      const meta = node.data?.meta;
      if (!meta) return;
      const pre = ctx.parent(node);
      const title = attr(meta, "title");
      if (title && pre?.type === "element" && pre.tagName === "pre") ctx.setProperty(pre, "dataTitle", title);
      const spec = attr(meta, "mark");
      if (!spec) return;
      const marked = lineSet(spec);
      const text = ctx.textContent(node).replace(/\n$/, "");
      const children = text.split("\n").flatMap((line, i) => {
        const piece = marked.has(i + 1)
          ? { type: "element", tagName: "mark", properties: {}, children: [{ type: "text", value: line }] }
          : { type: "text", value: line };
        return i ? [{ type: "text", value: "\n" }, piece] : [piece];
      });
      ctx.replaceNode(node, { type: "element", tagName: "code", properties: { ...node.properties }, children });
    },
  },
});

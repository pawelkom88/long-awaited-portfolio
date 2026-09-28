// The story page: the figure dozes and waves, the loose end unravels, the kite lifts without scroll timelines, the parcel flies.
import { EMAIL } from "../site.mjs";

const show = id => {
  for (const p of document.querySelectorAll(".stage-hero .pose")) p.hidden = p.id !== id;
};
// the figure dozes while you are away and waves when you come back
let away = false;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { away = true; show("dozing"); return; }
  if (!away) return;
  show("waving");
  setTimeout(() => show(tangle.classList.contains("pulled") ? "pulling" : "seated"), 1600);
});
// pull the loose end
const tangle = document.getElementById("tangle");
const unravel = document.getElementById("unravel");
const frames = [...unravel.querySelectorAll(".ink")];
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
tangle.addEventListener("click", () => {
  tangle.classList.add("pulled");
  let i = 0;
  const step = () => {
    frames[i].classList.remove("on");
    frames[++i].classList.add("on");
    if (i < frames.length - 1) return setTimeout(step, 190);
    show("pulling");
    unravel.classList.add("done");
  };
  if (still) { show("pulling"); unravel.classList.add("done"); return; }
  setTimeout(step, 120);
});
// the kite lifts on scroll in CSS; only browsers without scroll timelines need a hand
const scrolled = CSS.supports("(animation-timeline: view()) and (animation-range: entry)");
if (!scrolled || still) {
  const magic = document.getElementById("magic");
  const kite = [...magic.querySelectorAll(".ink")];
  const lift = () => {
    if (magic.classList.contains("lifted")) return;
    magic.classList.add("lifted");
    if (still) { kite.forEach((k, i) => k.classList.toggle("on", i === kite.length - 1)); return; }
    kite.forEach((k, i) => setTimeout(() => kite.forEach((o, j) => o.classList.toggle("on", j === i)), i * 700));
  };
  magic.addEventListener("click", lift);
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { setTimeout(lift, 600); io.disconnect(); } }, { threshold: .8 }).observe(magic);
}
// reach out and the balloon lifts the parcel off the line; the figure waves it away
const contact = document.querySelector(".stage-contact");
document.getElementById("send").addEventListener("click", () => {
  if (contact.classList.contains("sent")) return;
  contact.classList.add("sent");
  setTimeout(() => { contact.querySelector(".note-sent").textContent = "on its way"; }, still ? 0 : 1400);
});
console.log(`%cyou found the loose end. say hello: ${EMAIL}`, "font: italic 14px Georgia, serif; color: #b0311f");

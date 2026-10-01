// The story page: the figure dozes and waves, the loose end jams and the figure comes to help untie it, the kite lifts without scroll timelines, the parcel flies.
import { EMAIL } from "../site.mjs";

const show = id => {
  for (const p of document.querySelectorAll(".stage-hero .pose")) p.hidden = p.id !== id;
};
// the figure dozes while you are away and waves when you come back
let away = false;
let waveTimer;
document.addEventListener("visibilitychange", () => {
  // the figure is off helping with the knot: it finishes that first
  if (document.prerendering || hero.dataset.helper) return;
  if (document.hidden) {
    clearTimeout(waveTimer);
    away = true;
    show("dozing");
    return;
  }
  if (!away) return;
  away = false;
  clearTimeout(waveTimer);
  show("waving");
  waveTimer = setTimeout(() => show("seated"), 1600);
});
if (document.prerendering) {
  document.addEventListener("prerenderingchange", () => {
    away = false;
  }, { once: true });
}
// pull the loose end: drag it (or press, Enter, Space, the right arrow) and the knot gives a frame per pull,
// then jams. The figure walks over, kneels and works it loose, the visitor's last pull straightens it,
// the note is corrected in pencil and the freed line slips over the edge of the ledge
const tangle = document.getElementById("tangle");
const unravel = document.getElementById("unravel");
const hero = tangle.closest(".stage-hero");
const seated = document.getElementById("seated");
const say = document.getElementById("hero-say");
const status = document.getElementById("tangle-status");
const frames = [...unravel.querySelectorAll(".ink")];
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const JAM = 2, LAST = frames.length - 1;
const WALK = still ? 0 : 1500; // matches the walker's transition in story.css
const wait = ms => new Promise(done => setTimeout(done, ms));
let at = 0;
let phase = "knotted"; // knotted, stuck, ready, done
const locked = () => tangle.getAttribute("aria-disabled") === "true";
const lock = on => on ? tangle.setAttribute("aria-disabled", "true") : tangle.removeAttribute("aria-disabled");
const frame = i => {
  frames[at].classList.remove("on");
  frames[at = i].classList.add("on");
  unravel.classList.remove("tug");
  void unravel.offsetWidth; // restart the tug on every frame
  unravel.classList.add("tug");
};
const speak = text => {
  say.textContent = text;
  say.classList.toggle("on", Boolean(text));
};
// the helper pose takes a state per beat; a step without a transition first, so the walk starts from its mark
const helper = async (from, to) => {
  hero.dataset.helper = from;
  if (!to) return;
  void hero.offsetWidth;
  hero.dataset.helper = to;
  await wait(WALK);
};
const look = () => {
  if (still) return;
  // the look lasts one run of the reaction, then the idle clock takes the head back
  hero.classList.add("watching");
  const head = seated.querySelector(".head");
  head.addEventListener("animationend", function done(e) {
    if (e.animationName !== "watch-head") return; // the eye's own animations bubble up through the head
    head.removeEventListener("animationend", done);
    hero.classList.remove("watching");
  });
};
const jam = async () => {
  phase = "stuck";
  lock(true);
  unravel.classList.add("jammed");
  speak("hm, stuck");
  status.textContent = "It's stuck. The figure comes over to help.";
  await wait(1100);
  show("helper");
  await helper("set-off", "walk-in");
  await helper("kneel");
  speak("hang on");
  await wait(1700);
  unravel.classList.remove("jammed");
  frame(JAM + 1);
  speak("try now");
  status.textContent = "Loosened. Pull the loose end once more.";
  phase = "ready";
  lock(false);
};
const untie = async () => {
  phase = "done";
  lock(true);
  tangle.classList.add("pulled");
  speak("");
  status.textContent = "The loose end has been pulled. The line is now unknotted.";
  hero.classList.add("pulled");
  await wait(still ? 0 : 700);
  await helper("rise", "walk-back");
  show("seated");
  delete hero.dataset.helper;
};
const pull = () => {
  if (locked()) return;
  if (phase === "knotted" && at < JAM) {
    if (at === 0) look();
    return frame(at + 1);
  }
  if (phase === "knotted") return jam();
  if (phase === "ready") {
    frame(LAST);
    untie();
  }
};
// a drag pulls a frame per step of distance, and between frames the knot leans toward the hand;
// on release it springs back
let drag = null, dragged = false;
tangle.addEventListener("pointerdown", e => {
  if (locked() || e.button) return;
  drag = { x: e.clientX, taken: 0 };
  dragged = false;
  tangle.setPointerCapture(e.pointerId);
  unravel.classList.add("held");
});
tangle.addEventListener("pointermove", e => {
  if (!drag) return;
  const dx = e.clientX - drag.x, far = Math.abs(dx);
  if (far > 6) dragged = true;
  const step = hero.offsetWidth * .05;
  while (far - drag.taken * step > step && !locked()) {
    drag.taken++;
    pull();
  }
  const lean = locked() ? 0 : Math.min((far - drag.taken * step) / step, 1) * Math.sign(dx);
  unravel.style.setProperty("--pull", lean.toFixed(3));
});
const letGo = () => {
  drag = null;
  unravel.classList.remove("held");
  unravel.style.removeProperty("--pull");
};
tangle.addEventListener("pointerup", letGo);
tangle.addEventListener("pointercancel", letGo);
tangle.addEventListener("lostpointercapture", letGo);
tangle.addEventListener("click", () => {
  if (dragged) { dragged = false; return; } // the drag already pulled
  pull();
});
tangle.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") { e.preventDefault(); pull(); }
});
// the kite lifts on scroll in CSS; only browsers without scroll timelines need a hand
const scrolled = CSS.supports("(animation-timeline: view()) and (animation-range: entry)");
if (!scrolled || still) {
  const magic = document.getElementById("magic");
  if (magic) {
    const kite = [...magic.querySelectorAll(".ink")];
    const section = document.getElementById("lift");
    if (!still && section) {
      // no scroll timelines (Firefox): the same pin in CSS, and the scroll picks the frame by hand
      section.classList.add("js-lift");
      const pin = section.querySelector(".pin");
      const pinned = matchMedia("(width > 48rem)");
      let queued = false;
      const progress = () => {
        if (pinned.matches) {
          // the frames run while the pin holds: from the section top reaching the pin's top line
          // until the section bottom reaches its bottom line
          const hold = section.offsetHeight - pin.offsetHeight;
          return hold > 0 ? (parseFloat(getComputedStyle(pin).top) - section.getBoundingClientRect().top) / hold : 1;
        }
        // phones: as the stage rises up the screen, like `contain 0% contain 55%`
        const r = magic.getBoundingClientRect(), room = innerHeight - r.height;
        return room > 0 ? (innerHeight - r.bottom) / room / .55 : 1;
      };
      const frame = () => {
        queued = false;
        const p = progress();
        const on = p < .28 ? 0 : p < .58 ? 1 : 2;
        kite.forEach((k, i) => k.classList.toggle("on", i === on));
        magic.classList.toggle("lifted", p >= .76);
      };
      const queue = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
      addEventListener("scroll", queue, { passive: true });
      addEventListener("resize", queue);
      frame();
    } else {
      const lift = () => {
        if (magic.classList.contains("lifted")) return;
        magic.classList.add("lifted");
        if (still) { kite.forEach((k, i) => k.classList.toggle("on", i === kite.length - 1)); return; }
        kite.forEach((_, i) => setTimeout(() => kite.forEach((o, j) => o.classList.toggle("on", j === i)), i * 700));
      };
      const observeMagic = () => {
        new IntersectionObserver(([e], io) => { if (e.isIntersecting) { setTimeout(lift, 600); io.disconnect(); } }, { threshold: .8 }).observe(magic);
      };
      if (document.prerendering) {
        document.addEventListener("prerenderingchange", observeMagic, { once: true });
      } else {
        observeMagic();
      }
    }
  }
}
// reach out and the balloon lifts the parcel off the line; the figure waves it away
const contact = document.querySelector(".stage-contact");
document.getElementById("send").addEventListener("click", () => {
  if (contact.classList.contains("sent")) return;
  contact.classList.add("sent");
  setTimeout(() => { contact.querySelector(".note-sent").textContent = "on its way"; }, still ? 0 : 1400);
});

// pluck the knot: the wave runs from the knot back along the shelf, one low note if the tune is on
const snag = document.querySelector(".snag");
if (snag) {
  const work = snag.closest(".work");
  const note = snag.querySelector(".snag-note");
  const things = [...work.querySelectorAll(".thing")];
  things.forEach((t, i) => t.style.setProperty("--i", things.length - 1 - i));
  let rest;
  snag.addEventListener("click", () => {
    work.classList.remove("plucked");
    void work.offsetWidth; // restart the wave on every pluck
    work.classList.add("plucked");
    note.textContent = "still holds";
    const live = document.getElementById("snag-live");
    if (live) live.textContent = "Thread plucked: still holds";
    document.dispatchEvent(new CustomEvent("ink:pluck"));
    clearTimeout(rest);
    rest = setTimeout(() => {
      work.classList.remove("plucked");
      note.textContent = "took a week, worth it";
    }, 2400);
  });
  // Esc hides the note, the next pointer or focus move brings it back
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      snag.classList.add("dismissed");
    }
  });
  snag.addEventListener("pointerleave", () => snag.classList.remove("dismissed"));
  snag.addEventListener("blur", () => snag.classList.remove("dismissed"));
}


console.log(`%cyou found the loose end. say hello: ${EMAIL}`, "font: italic 14px Georgia, serif; color: #a32c1b");

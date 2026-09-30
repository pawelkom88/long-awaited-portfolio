// A music box you can wind up. Off until asked; the choice is remembered. Wound up in this visit,
// it keeps playing onto the next page (browsers that want a fresh gesture get it from the first tap).
// Everything is synthesised: a plucked comb tune (brighter by day, a slower lullaby at night),
// a tick for the pull cord and a papery scrub for the rubber.
const root = document.documentElement;
const system = matchMedia("(prefers-color-scheme: dark)");
const btn = document.getElementById("sound");
const night = () => (root.dataset.theme ?? (system.matches ? "dark" : "light")) === "dark";

const DAY = { scale: [0, 2, 4, 7, 9], base: 72, step: .42 };    // C major pentatonic, up high
const NIGHT = { scale: [0, 3, 5, 7, 10], base: 57, step: .62 }; // A minor pentatonic, lower and slower
const hz = midi => 440 * 2 ** ((midi - 69) / 12);

let ctx, out, verb, on = false, timer, next = 0, step = 0, phrase = [];

const setup = () => {
  ctx = new AudioContext();
  out = ctx.createGain();
  out.gain.value = .16;
  // a small room: a convolver fed a second of decaying noise
  verb = ctx.createConvolver();
  const len = ctx.sampleRate * 2.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  verb.buffer = ir;
  const wet = ctx.createGain();
  wet.gain.value = .35;
  out.connect(ctx.destination);
  verb.connect(wet).connect(ctx.destination);
};

// one tine of the comb: a sine with a faint high partial, struck and left to ring
const pluck = (freq, at, gain = 1) => {
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(.5 * gain, at + .005);
  env.gain.exponentialRampToValueAtTime(.0001, at + 1.8);
  env.connect(out);
  env.connect(verb);
  for (const [mult, level] of [[1, 1], [4.02, .12]]) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.frequency.value = freq * mult;
    g.gain.value = level;
    osc.connect(g).connect(env);
    osc.start(at);
    osc.stop(at + 1.9);
  }
};

// a phrase is a short random walk on the scale, heard twice before the next one
const newPhrase = () => {
  let i = 2 + Math.floor(Math.random() * 3);
  phrase = Array.from({ length: 8 }, (_, k) => {
    i = Math.max(0, Math.min(9, i + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]));
    return k % 4 === 3 && Math.random() < .5 ? null : i; // leave some room to breathe
  });
};

const schedule = () => {
  while (next < ctx.currentTime + .3) {
    const mode = night() ? NIGHT : DAY;
    if (step % 16 === 0) newPhrase();
    const i = phrase[step % 8];
    if (i != null) pluck(hz(mode.base + mode.scale[i % 5] + 12 * Math.floor(i / 5)), next, .8 + Math.random() * .2);
    if (step % 8 === 0) pluck(hz(mode.base - 12 + mode.scale[0]), next, .5); // a low note under each bar
    next += mode.step * (1 + (Math.random() - .5) * .06); // wound by hand, never quite even
    step++;
  }
};

const noise = (dur, at, filter) => {
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(filter);
  src.start(at);
  return src;
};

// the cord: a dry little click
const tick = () => {
  const at = ctx.currentTime, f = ctx.createBiquadFilter(), g = ctx.createGain();
  f.type = "highpass";
  f.frequency.value = 2500;
  g.gain.setValueAtTime(.9, at);
  g.gain.exponentialRampToValueAtTime(.001, at + .05);
  noise(.06, at, f).connect(g);
  f.connect(g).connect(out);
};

// the rubber: band-passed noise, swelling on every pass across the page
const scrub = (dur, rows) => {
  const at = ctx.currentTime, f = ctx.createBiquadFilter(), g = ctx.createGain();
  f.type = "bandpass";
  f.frequency.value = 1400;
  f.Q.value = .8;
  g.gain.setValueAtTime(0, at);
  for (let r = 0; r < rows; r++) {
    const t = at + (r / rows) * dur;
    g.gain.linearRampToValueAtTime(.55, t + dur / rows * .4);
    g.gain.linearRampToValueAtTime(.12, t + dur / rows);
  }
  g.gain.linearRampToValueAtTime(0, at + dur + .05);
  noise(dur + .1, at, f);
  f.connect(g).connect(out);
};

const start = async () => {
  if (!ctx) setup();
  await ctx.resume();
  next = ctx.currentTime + .45;
  step = 0;
  clearInterval(timer);
  timer = setInterval(schedule, 100);
};
const stop = () => {
  clearInterval(timer);
  ctx?.suspend();
};

const set = (value, { remember = true } = {}) => {
  on = value;
  btn.setAttribute("aria-pressed", on);
  if (remember) {
    try {
      if (on) {
        localStorage.setItem("sound", "on");
        sessionStorage.setItem("sound", "playing"); // this visit: carry the tune across pages
      } else {
        localStorage.removeItem("sound");
        sessionStorage.removeItem("sound");
      }
    } catch {}
  }
};

btn.addEventListener("click", () => {
  if (on && (!ctx || ctx.state !== "running")) {
    btn.classList.remove("jiggle");
    void btn.offsetWidth;
    btn.classList.add("jiggle");
    start();
    return;
  }
  set(!on);
  btn.classList.remove("jiggle");
  void btn.offsetWidth;
  btn.classList.add("jiggle");
  if (!on) return stop();
  start();
});

// remembered "on": show it. If it was playing a page ago, play on; where the browser holds
// audio back for a gesture, the first tap anywhere resumes it. Keystrokes never do, so the
// tune cannot start over a screen reader.
let remembered = false, playing = false;
try {
  remembered = localStorage.getItem("sound") === "on";
  playing = sessionStorage.getItem("sound") === "playing";
} catch {}
if (remembered) {
  set(true, { remember: false });
  if (playing) {
    start();
    const wake = e => {
      if (on && ctx?.state !== "running" && !btn.contains(e.target)) start();
    };
    addEventListener("pointerdown", wake, { once: true, capture: true });
  }
}

// quiet while the tab is away
document.addEventListener("visibilitychange", () => {
  if (!on || !ctx) return;
  if (document.hidden) stop();
  else start();
});

document.addEventListener("ink:tug", () => on && ctx?.state === "running" && tick());
// the shelf string, plucked: one low tine under whatever the box is playing
document.addEventListener("ink:pluck", () => on && ctx?.state === "running" && pluck(hz((night() ? NIGHT : DAY).base - 12), ctx.currentTime, 1));
document.addEventListener("ink:rub", e => on && ctx?.state === "running" && scrub(e.detail.duration, e.detail.rows));

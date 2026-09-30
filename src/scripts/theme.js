// Pull the cord: the bulb flips at once, then a rubber rubs the page out into the other theme.
// Two states only: follow the system, or the opposite of it pinned on <html> and remembered.
const root = document.documentElement;
const meta = document.querySelector('meta[name="color-scheme"]');
const system = matchMedia("(prefers-color-scheme: dark)");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const btn = document.getElementById("theme");

const systemScheme = () => (system.matches ? "dark" : "light");
const isDark = () => (root.dataset.theme ?? systemScheme()) === "dark";
const sync = () => {
  if (!btn) return;
  const dark = isDark();
  btn.setAttribute("aria-pressed", dark);
  btn.setAttribute("aria-label", dark ? "Pull cord: switch to light theme" : "Pull cord: switch to dark theme");
};

const apply = scheme => {
  // matching the system means following it again, so a later OS change still counts
  const pin = scheme === systemScheme() ? null : scheme;
  if (pin) root.dataset.theme = pin;
  else delete root.dataset.theme;
  meta.content = pin ?? "light dark";
  try {
    if (pin) localStorage.setItem("color-scheme", pin);
    else localStorage.removeItem("color-scheme");
  } catch {}
  sync();
};

btn.addEventListener("click", () => {
  btn.classList.remove("tug");
  void btn.offsetWidth; // restart the tug on a quick second pull
  btn.classList.add("tug");
  document.dispatchEvent(new Event("ink:tug"));
  const flip = () => apply(isDark() ? "light" : "dark");
  if (still.matches || !document.startViewTransition) return flip();
  // let the cord reach the bottom of its pull first
  setTimeout(() => {
    document.startViewTransition(flip).ready.then(() => {
      const css = getComputedStyle(root);
      const detail = { duration: +css.getPropertyValue("--rub-duration"), rows: +css.getPropertyValue("--rub-rows") };
      document.dispatchEvent(new CustomEvent("ink:rub", { detail }));
    });
  }, 240);
});
system.addEventListener("change", sync);
sync();

// rummage for a moment, then hold the empty drawer up
const lost = document.getElementById("lost");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const giveUp = () => {
  document.getElementById("searching").hidden = true;
  document.getElementById("empty").hidden = false;
  lost.classList.add("found-nothing");
};
setTimeout(giveUp, still ? 0 : 2200);

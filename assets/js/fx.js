/* Motion layer: decorative effects only. Nothing here is needed to shop.
   Off for reduced-motion users; mouse-only effects stay off on touch screens. */
import { $$, reducedMotion } from "./utils.js?v=202610260051";

const finePointer = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Little bubble burst from an element (used when something is added to the cart). */
export function burst(el) {
  if (reducedMotion() || !el) return;
  const r = el.getBoundingClientRect();
  const box = document.createElement("div");
  box.className = "burst";
  box.style.left = `${r.left + r.width / 2}px`;
  box.style.top = `${r.top + r.height / 2}px`;
  const colors = ["#E93D82", "#C3FF68", "#F7B6D2", "#3CC5B5", "#FFF3C4"];
  box.innerHTML = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 + Math.random() * .4, d = 40 + Math.random() * 50;
    return `<i style="--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d - 20}px;--s:${6 + Math.random() * 8}px;--c:${colors[i % colors.length]}"></i>`;
  }).join("");
  document.body.append(box);
  setTimeout(() => box.remove(), 800);
}

function cursorBlob() {
  const blob = document.createElement("div");
  blob.className = "cursor-blob hide";
  blob.setAttribute("aria-hidden", "true");
  document.body.append(blob);
  let x = 0, y = 0, tx = 0, ty = 0, running = false;
  const tick = () => {
    x += (tx - x) * 0.18; y += (ty - y) * 0.18;
    blob.style.transform = `translate(${x}px, ${y}px)`;
    if (Math.abs(tx - x) + Math.abs(ty - y) > 0.3) requestAnimationFrame(tick); else running = false;
  };
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    tx = e.clientX; ty = e.clientY; blob.classList.remove("hide");
    blob.classList.toggle("big", !!e.target.closest("a, button, .pcard__media, .hero-stage"));
    if (!running) { running = true; requestAnimationFrame(tick); }
  }, { passive: true });
  document.addEventListener("mouseleave", () => blob.classList.add("hide"));
}

function tiltCards() {
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const media = e.target.closest(".pcard__media");
    $$(".pcard__media.tilting").forEach((m) => { if (m !== media) { m.classList.remove("tilting"); m.style.transform = ""; } });
    if (!media || e.target.closest(".pcard__quick")) return; // keep the button still while it's being clicked
    const r = media.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    media.classList.add("tilting");
    media.style.transform = `perspective(700px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 12}deg)`;
    media.style.setProperty("--mx", `${px * 100}%`);
    media.style.setProperty("--my", `${py * 100}%`);
  }, { passive: true });
}

function parallax() {
  const els = $$("[data-parallax]");
  if (!els.length) return;
  let ticking = false;
  const update = () => {
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      el.style.transform = `translateY(${(r.top + r.height / 2 - innerHeight / 2) * -0.06}px)`;
    });
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

/** Counts numbers up the first time they scroll into view: <b data-count="20" data-suffix=" wks">. */
function countUp() {
  const els = $$("[data-count]");
  if (!els.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    io.unobserve(en.target);
    const el = en.target, end = Number(el.dataset.count), suffix = el.dataset.suffix || "";
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 1100);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
}

export function initFx() {
  // Bubble burst on every add-to-cart button, wherever it is.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add], [data-qv-add], #buyForm button[type=submit], .buybar button");
    if (btn && !btn.disabled) burst(btn);
  });
  if (reducedMotion()) return;
  parallax();
  countUp();
  if (finePointer()) { cursorBlob(); tiltCards(); }
}

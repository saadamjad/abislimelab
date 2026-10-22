import { CONFIG } from "./config.js?v=202610230304";

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

/** Formats whole rupees, e.g. "Rs 1,250". Used everywhere money is shown. */
export const pkr = (n) => "Rs " + Math.round(Number(n) || 0).toLocaleString("en-US");

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** localStorage wrapper that never throws (private mode, blocked storage). */
export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  },
};

/** Accepts 03XXXXXXXXX, 3XXXXXXXXX, 923XXXXXXXXX, +92 3XX XXXXXXX, 0092...; returns "923XXXXXXXXX" or null. */
export function normalizePkPhone(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.startsWith("0092")) d = d.slice(4);
  else if (d.startsWith("92")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  return /^3\d{9}$/.test(d) ? "92" + d : null;
}
export const formatPkPhone = (n) => (n ? `+92 ${n.slice(2, 5)} ${n.slice(5)}` : "");

export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim());

/** Unguessable order reference like ASL-7KQ2M9XP. */
export function newOrderRef() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return "ASL-" + [...bytes].map((b) => abc[b % abc.length]).join("");
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = Object.assign(document.createElement("textarea"), { value: text });
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.append(ta); ta.select();
    const ok = document.execCommand("copy"); ta.remove(); return ok;
  }
}

let toastTimer;
export function toast(html) {
  let t = $("#toast");
  if (!t) { t = Object.assign(document.createElement("div"), { id: "toast", className: "toast" }); t.setAttribute("role", "status"); document.body.append(t); }
  t.innerHTML = html;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
}

/** Loads a classic script once, e.g. a CDN library. */
const loaded = {};
export function loadScript(src) {
  return (loaded[src] ||= new Promise((res, rej) => {
    const s = Object.assign(document.createElement("script"), { src, async: true, crossOrigin: "anonymous" });
    s.onload = res; s.onerror = () => { delete loaded[src]; rej(new Error("Failed to load " + src)); };
    document.head.append(s);
  }));
}

export const shippingText = () => {
  const { flatFee, freeOver } = CONFIG.shipping;
  return pkr(flatFee) + (freeOver > 0 ? ` (free on orders over ${pkr(freeOver)})` : "");
};

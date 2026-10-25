import { CONFIG } from "./config.js?v=202610260125";
import { getProduct, normalizeSelection, unitPrice, variantLabel, maxQty } from "./catalog.js?v=202610260125";
import { store } from "./utils.js?v=202610260125";

const KEY = "asl_cart_v1";
const read = () => (Array.isArray(store.get(KEY, [])) ? store.get(KEY, []) : []);
const write = (items) => { store.set(KEY, items); window.dispatchEvent(new CustomEvent("cart:change")); };
const keyFor = (slug, sel) => slug + "|" + JSON.stringify(sel);
const clampQty = (q, max = CONFIG.maxQtyPerItem) => Math.max(1, Math.min(max, Math.floor(Number(q) || 1)));

// Keep tabs in sync.
window.addEventListener("storage", (e) => { if (e.key === KEY) window.dispatchEvent(new CustomEvent("cart:change")); });

export const cart = {
  /** Returns false when the product cannot be added. */
  add(slug, sel = {}, qty = 1) {
    const p = getProduct(slug);
    if (!p || p.stock === "out") return false;
    const max = maxQty(p);
    const s = normalizeSelection(p, sel);
    const items = read();
    const key = keyFor(slug, s);
    const found = items.find((i) => i.key === key);
    const inCart = items.filter((i) => i.slug === slug && i.key !== key).reduce((n, i) => n + i.qty, 0);
    const room = max - inCart - (found ? found.qty : 0);
    if (room <= 0) return false; // already holding every jar we have
    if (found) found.qty += Math.min(qty, room);
    else items.push({ key, slug, sel: s, qty: clampQty(Math.min(qty, room), max) });
    write(items);
    return true;
  },
  setQty(key, qty) {
    const items = read();
    const it = items.find((i) => i.key === key);
    if (!it) return;
    const p = getProduct(it.slug);
    const others = items.filter((i) => i.slug === it.slug && i.key !== key).reduce((n, i) => n + i.qty, 0);
    it.qty = clampQty(qty, Math.max(1, maxQty(p) - others));
    write(items);
  },
  remove(key) { write(read().filter((i) => i.key !== key)); },
  clear() { write([]); },
  raw: read,

  /** Resolves stored items against the catalog. Prices are recalculated every time. */
  summary() {
    const lines = read().map((i) => {
      const p = getProduct(i.slug);
      if (!p) return { ...i, unavailable: true, reason: "This product is no longer available." };
      const sel = normalizeSelection(p, i.sel);
      const price = unitPrice(p, sel);
      const qty = clampQty(i.qty, Math.max(1, maxQty(p)));
      return {
        key: i.key, slug: p.slug, product: p, sel, variant: variantLabel(sel), qty, unitPrice: price,
        lineTotal: price * qty, max: maxQty(p), unavailable: p.stock === "out", reason: p.stock === "out" ? "Sold out. Remove it to continue." : "",
      };
    });
    const ok = lines.filter((l) => !l.unavailable);
    const subtotal = ok.reduce((s, l) => s + l.lineTotal, 0);
    const { flatFee, freeOver } = CONFIG.shipping;
    const shipping = subtotal === 0 ? 0 : freeOver > 0 && subtotal >= freeOver ? 0 : flatFee;
    return {
      lines, subtotal, shipping, discount: 0, total: subtotal + shipping,
      count: ok.reduce((s, l) => s + l.qty, 0), hasUnavailable: lines.some((l) => l.unavailable),
    };
  },
};

import { CONFIG } from "./config.js";
import { getProduct, normalizeSelection, unitPrice, variantLabel } from "./catalog.js";
import { store } from "./utils.js";

const KEY = "asl_cart_v1";
const read = () => (Array.isArray(store.get(KEY, [])) ? store.get(KEY, []) : []);
const write = (items) => { store.set(KEY, items); window.dispatchEvent(new CustomEvent("cart:change")); };
const keyFor = (slug, sel) => slug + "|" + JSON.stringify(sel);
const clampQty = (q) => Math.max(1, Math.min(CONFIG.maxQtyPerItem, Math.floor(Number(q) || 1)));

// Keep tabs in sync.
window.addEventListener("storage", (e) => { if (e.key === KEY) window.dispatchEvent(new CustomEvent("cart:change")); });

export const cart = {
  /** Returns false when the product cannot be added. */
  add(slug, sel = {}, qty = 1) {
    const p = getProduct(slug);
    if (!p || p.stock === "out") return false;
    const s = normalizeSelection(p, sel);
    const items = read();
    const key = keyFor(slug, s);
    const found = items.find((i) => i.key === key);
    if (found) found.qty = clampQty(found.qty + qty);
    else items.push({ key, slug, sel: s, qty: clampQty(qty) });
    write(items);
    return true;
  },
  setQty(key, qty) {
    const items = read();
    const it = items.find((i) => i.key === key);
    if (it) { it.qty = clampQty(qty); write(items); }
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
      const qty = clampQty(i.qty);
      return {
        key: i.key, slug: p.slug, product: p, sel, variant: variantLabel(sel), qty, unitPrice: price,
        lineTotal: price * qty, unavailable: p.stock === "out", reason: p.stock === "out" ? "Sold out. Remove it to continue." : "",
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

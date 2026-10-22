import { categories, products } from "../../data/products.js";
import { CONFIG } from "./config.js";
import { esc, pkr } from "./utils.js";
import { slimeSVG } from "./slime-svg.js";

export { categories, products };

export const getProduct = (slug) => products.find((p) => p.slug === slug) || null;
export const getCategory = (id) => categories.find((c) => c.id === id) || null;
export const inCategory = (id) => products.filter((p) => p.category === id);

/** Returns a selection where every variant has a valid option (defaults to the first). */
export function normalizeSelection(p, sel = {}) {
  const out = {};
  for (const v of p.variants || []) {
    const ok = v.options.some((o) => o.label === sel[v.name]);
    out[v.name] = ok ? sel[v.name] : v.options[0].label;
  }
  return out;
}

/** Unit price always comes from the catalog, never from stored cart data. */
export function unitPrice(p, sel = {}) {
  let price = p.price;
  for (const v of p.variants || []) {
    const opt = v.options.find((o) => o.label === sel[v.name]);
    if (opt) price += opt.delta || 0;
  }
  return price;
}

export const variantLabel = (sel = {}) => Object.entries(sel).map(([k, v]) => `${k}: ${v}`).join(" · ");

export const minPrice = (p) => p.price;
export const hasPriceRange = (p) => (p.variants || []).some((v) => v.options.some((o) => o.delta));

export const STOCK = {
  in: { label: "In stock", cls: "ok" },
  low: { label: "Only a few left", cls: "low" },
  out: { label: "Sold out", cls: "out" },
};

export const productUrl = (p) => `product.html?slug=${encodeURIComponent(p.slug)}`;

/** Product visual: real images when provided, otherwise a drawn glossy slime. */
export function slimeArt(p, { eager = false, cls = "" } = {}) {
  const cat = getCategory(p.category);
  if (p.images?.length) {
    return `<div class="slime-art slime-art--img ${cls}"><img src="${esc(p.images[0])}" alt="${esc(p.name)} slime" ${eager ? "" : 'loading="lazy"'} decoding="async"></div>`;
  }
  const tex = cat?.texture || "butter";
  return `<div class="slime-art slime-art--${esc(tex)} ${cls}" style="--bg:${esc(cat?.color || "#fff")}" role="img" aria-label="${esc(p.name)} slime">
    ${slimeSVG(tex, p.c1 || "#FF8FC0", p.c2 || "#FFD1E8", p.slug)}
    <span class="slime-art__topper" aria-hidden="true">${esc(p.emoji || "")}</span>
  </div>`;
}

export function badges(p) {
  const b = [];
  if (p.stock === "out") b.push('<span class="badge badge--out">Sold out</span>');
  else if (p.stock === "low") b.push('<span class="badge badge--low">Few left</span>');
  if (p.bestSeller) b.push('<span class="badge badge--hot">Best seller</span>');
  if (p.isNew) b.push('<span class="badge badge--new">New</span>');
  if (p.sample && CONFIG.showSampleBadges) b.push('<span class="badge badge--sample">Sample</span>');
  return b.join("");
}

export function productCard(p) {
  const cat = getCategory(p.category);
  const out = p.stock === "out";
  return `<article class="pcard reveal">
    <div class="pcard__media"><a href="${productUrl(p)}" tabindex="-1" aria-hidden="true">${slimeArt(p)}</a><div class="pcard__badges">${badges(p)}</div>
      <button class="pcard__quick" type="button" data-quick="${esc(p.slug)}" aria-label="Quick view ${esc(p.name)}">👀 Quick view</button></div>
    <div class="pcard__body">
      <p class="pcard__cat">${esc(cat?.name || "")}</p>
      <h3 class="pcard__title"><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
      <p class="pcard__desc">${esc(p.description)}</p>
      <div class="pcard__foot">
        <span class="price">${hasPriceRange(p) ? '<small>from</small> ' : ""}${pkr(minPrice(p))}</span>
        <button class="btn btn--sm ${out ? "btn--disabled" : "btn--pink"}" data-add="${esc(p.slug)}" ${out ? "disabled" : ""} aria-label="${out ? "Sold out" : "Add " + esc(p.name) + " to cart"}">${out ? "Sold out" : "Add +"}</button>
      </div>
    </div>
  </article>`;
}

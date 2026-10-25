/* Quick view: preview a product and add it to the cart from any product card. */
import { getProduct, getCategory, slimeArt, badges, unitPrice, normalizeSelection, productUrl, stockInfo, maxQty, optionsHTML } from "./catalog.js?v=202610260125";
import { cart } from "./cart.js?v=202610260125";
import { $, $$, esc, pkr, toast } from "./utils.js?v=202610260125";

let dlg;
function ensureDialog() {
  if (dlg) return dlg;
  dlg = document.createElement("dialog");
  dlg.className = "qv";
  dlg.setAttribute("aria-labelledby", "qvTitle");
  document.body.append(dlg);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); }); // backdrop click
  return dlg;
}

export function openQuickView(slug) {
  const p = getProduct(slug);
  if (!p) return;
  const d = ensureDialog();
  const cat = getCategory(p.category);
  const sel = normalizeSelection(p);
  let qty = 1;
  const out = p.stock === "out";
  const stock = stockInfo(p);
  const max = Math.max(1, maxQty(p));
  d.innerHTML = `
    <button class="qv__close icon-btn" type="button" aria-label="Close quick view">✕</button>
    <div class="qv__grid">
      <div class="qv__media">${slimeArt(p, { eager: true })}<div class="pcard__badges">${badges(p)}</div></div>
      <form class="qv__info" method="dialog">
        <p class="pcard__cat">${esc(cat?.name || "")}</p>
        <h2 id="qvTitle">${esc(p.name)}</h2>
        <p class="pdp__price" data-qv-price>${pkr(unitPrice(p, sel))}</p>
        <p class="stock stock--${stock.cls}"><i aria-hidden="true"></i>${stock.label}</p>
        <p class="pdp__desc">${esc(p.description)}</p>
        ${optionsHTML(p, "qv")}
        <div class="pdp__buy">
          <div class="qty" role="group" aria-label="Quantity">
            <button type="button" data-qvq="-1" aria-label="Decrease quantity">−</button>
            <output data-qv-qty aria-live="polite">1</output>
            <button type="button" data-qvq="1" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn btn--pink btn--lg btn--grow" type="button" data-qv-add ${out ? "disabled" : ""}>${out ? "Sold out" : "Add to cart"}</button>
        </div>
        <a class="qv__more" href="${productUrl(p)}">See full details →</a>
      </form>
    </div>`;
  const price = () => { $("[data-qv-price]", d).textContent = pkr(unitPrice(p, sel) * qty); };
  $$("input[data-variant]", d).forEach((r) => r.addEventListener("change", () => {
    sel[r.dataset.variant] = r.value;
    const picked = d.querySelector(`[data-picked="${CSS.escape(r.dataset.variant)}"]`);
    if (picked) picked.textContent = r.value;
    price();
  }));
  $$("[data-qvq]", d).forEach((b) => b.addEventListener("click", () => {
    qty = Math.max(1, Math.min(max, qty + Number(b.dataset.qvq)));
    $("[data-qv-qty]", d).textContent = qty; price();
  }));
  $(".qv__close", d).addEventListener("click", () => d.close());
  $("[data-qv-add]", d).addEventListener("click", () => {
    if (cart.add(p.slug, sel, qty)) { d.close(); toast(`<b>${esc(p.name)}</b> × ${qty} added 🫧 <a href="cart.html">View cart →</a>`); }
    else toast(`You already have all available ${esc(p.name)} jars in your cart.`);
  });
  d.showModal();
}

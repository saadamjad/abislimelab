import { initLayout } from "../layout.js?v=202610251319";
import { CONFIG } from "../config.js?v=202610251319";
import { cart } from "../cart.js?v=202610251319";
import { slimeArt, productUrl } from "../catalog.js?v=202610251319";
import { $, esc, pkr } from "../utils.js?v=202610251319";
import { summaryBox } from "./shared.js?v=202610251319";

initLayout("cart.html");
const root = $("#cartRoot");

function render() {
  const s = cart.summary();
  if (!s.lines.length) {
    root.innerHTML = `<div class="empty"><p class="empty__emoji" aria-hidden="true">🫙</p><h2>Your cart is empty</h2><p>Your next favorite slime is waiting.</p><a class="btn btn--pink btn--lg" href="shop.html">Shop slimes</a></div>`;
    return;
  }
  root.innerHTML = `<div class="cart-layout">
    <ul class="lines">${s.lines.map((l) => l.product ? `
      <li class="line ${l.unavailable ? "line--bad" : ""}">
        <a class="line__art" href="${productUrl(l.product)}" tabindex="-1" aria-hidden="true">${slimeArt(l.product)}</a>
        <div class="line__info">
          <h3><a href="${productUrl(l.product)}">${esc(l.product.name)}</a></h3>
          ${l.variant ? `<p class="line__var">${esc(l.variant)}</p>` : ""}
          <p class="line__unit">${pkr(l.unitPrice)} each</p>
          ${l.reason ? `<p class="line__warn">${esc(l.reason)}</p>` : ""}
        </div>
        <div class="line__ctrl">
          ${l.unavailable ? "" : `<div class="qty qty--sm" role="group" aria-label="Quantity for ${esc(l.product.name)}">
            <button type="button" data-dec="${esc(l.key)}" aria-label="Decrease" ${l.qty <= 1 ? "disabled" : ""}>−</button>
            <output aria-live="polite">${l.qty}</output>
            <button type="button" data-inc="${esc(l.key)}" aria-label="Increase" ${l.qty >= CONFIG.maxQtyPerItem ? "disabled" : ""}>+</button></div>`}
          <p class="line__total">${l.unavailable ? "–" : pkr(l.lineTotal)}</p>
          <button type="button" class="link-btn" data-rm="${esc(l.key)}">Remove</button>
        </div>
      </li>` : `
      <li class="line line--bad"><div class="line__info"><h3>Unavailable item</h3><p class="line__warn">${esc(l.reason)}</p></div>
        <div class="line__ctrl"><button type="button" class="link-btn" data-rm="${esc(l.key)}">Remove</button></div></li>`).join("")}
    </ul>
    ${summaryBox(s)}
  </div>
  <p class="cart-more"><a href="shop.html">← Keep shopping</a></p>`;
}

root.addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  const raw = cart.raw();
  const find = (k) => raw.find((i) => i.key === k);
  if (b.dataset.inc) cart.setQty(b.dataset.inc, find(b.dataset.inc).qty + 1);
  if (b.dataset.dec) cart.setQty(b.dataset.dec, find(b.dataset.dec).qty - 1);
  if (b.dataset.rm) cart.remove(b.dataset.rm);
});
window.addEventListener("cart:change", render);
render();

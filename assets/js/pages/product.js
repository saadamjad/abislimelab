import { initLayout, refreshReveal } from "../layout.js?v=202610230304";
import { CONFIG } from "../config.js?v=202610230304";
import { getProduct, getCategory, inCategory, products, productCard, slimeArt, badges, unitPrice, normalizeSelection, STOCK } from "../catalog.js?v=202610230304";
import { cart } from "../cart.js?v=202610230304";
import { setWidgetContext } from "../whatsapp.js?v=202610230304";
import { $, $$, esc, pkr, toast, shippingText } from "../utils.js?v=202610230304";

initLayout("shop.html");

const slug = new URLSearchParams(location.search).get("slug");
const p = getProduct(slug);
const root = $("#product");

if (!p) {
  document.title = "Slime not found | Abi's Slime Lab";
  const m = document.createElement("meta"); m.name = "robots"; m.content = "noindex"; document.head.append(m);
  root.innerHTML = `<div class="empty"><p class="empty__emoji" aria-hidden="true">🫠</p><h1>This slime slid away</h1><p>We couldn't find that product. It may have been renamed or removed.</p><a class="btn btn--pink" href="shop.html">Browse all slimes</a></div>`;
} else {
  render();
}

function render() {
  const cat = getCategory(p.category);
  const url = `${CONFIG.siteUrl}/product.html?slug=${encodeURIComponent(p.slug)}`;
  document.title = `${p.name} ${cat ? "· " + cat.name : ""} | ${CONFIG.storeName}`;
  $('meta[name="description"]').content = p.description;
  $('link[rel="canonical"]').href = url;
  $('meta[property="og:title"]').content = `${p.name} | ${CONFIG.storeName}`;
  $('meta[property="og:description"]').content = p.description;
  $('meta[property="og:url"]').content = url;

  let sel = normalizeSelection(p);
  let qty = 1;
  const stock = STOCK[p.stock] || STOCK.in;
  const out = p.stock === "out";

  root.innerHTML = `
  <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><a href="shop.html">Shop</a><span aria-hidden="true">/</span>${cat ? `<a href="shop.html?cat=${esc(cat.id)}">${esc(cat.name)}</a><span aria-hidden="true">/</span>` : ""}<span aria-current="page">${esc(p.name)}</span></nav>
  <div class="pdp">
    <div class="pdp__media">
      <div class="pdp__stage" id="pdpStage">${slimeArt(p, { eager: true, cls: "slime-art--xl" })}<div class="pcard__badges">${badges(p)}</div><span class="pdp__hint" aria-hidden="true">tap to squish</span></div>
      ${(p.images?.length || 0) > 1 ? `<div class="pdp__thumbs">${p.images.map((src, i) => `<button type="button" data-img="${esc(src)}" aria-label="Show image ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
    </div>
    <div class="pdp__info">
      <p class="pcard__cat">${esc(cat?.name || "")}</p>
      <h1 class="pdp__title">${esc(p.name)}</h1>
      <p class="pdp__price" id="price" aria-live="polite">${pkr(unitPrice(p, sel))}</p>
      <p class="stock stock--${stock.cls}"><i aria-hidden="true"></i>${stock.label}</p>
      <p class="pdp__desc">${esc(p.description)}</p>
      <form id="buyForm" class="pdp__form">
        ${(p.variants || []).map((v, vi) => `
          <fieldset class="opts"><legend>${esc(v.name)}</legend>
          ${v.options.map((o, oi) => `<label class="opt"><input type="radio" name="v${vi}" data-variant="${esc(v.name)}" value="${esc(o.label)}" ${oi === 0 ? "checked" : ""}><span>${esc(o.label)}${o.delta ? ` <small>+${pkr(o.delta)}</small>` : ""}</span></label>`).join("")}
          </fieldset>`).join("")}
        <div class="pdp__buy">
          <div class="qty" role="group" aria-label="Quantity">
            <button type="button" data-q="-1" aria-label="Decrease quantity">−</button>
            <input id="qty" type="number" inputmode="numeric" min="1" max="${CONFIG.maxQtyPerItem}" value="1" aria-label="Quantity">
            <button type="button" data-q="1" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn btn--pink btn--lg btn--grow ${out ? "btn--disabled" : ""}" type="submit" ${out ? "disabled" : ""}>${out ? "Sold out" : "Add to cart"}</button>
        </div>
      </form>
      <ul class="pdp__perks">
        <li><b>🧾 No card needed.</b> Place your order, then confirm it on WhatsApp.</li>
        <li><b>🚚 Delivery:</b> <span>${esc(shippingText())}</span> within Pakistan.</li>
        <li><b>💬 Questions?</b> <a href="#" data-open-wa>Ask us on WhatsApp</a>.</li>
      </ul>
    </div>
  </div>`;

  const priceEl = $("#price"), qtyEl = $("#qty");
  const updatePrice = () => { $("#price").textContent = pkr(unitPrice(p, sel) * qty) + (qty > 1 ? ` (${qty} × ${pkr(unitPrice(p, sel))})` : ""); };
  $$("input[data-variant]").forEach((r) => r.addEventListener("change", () => { sel[r.dataset.variant] = r.value; updatePrice(); }));
  const setQty = (n) => { qty = Math.max(1, Math.min(CONFIG.maxQtyPerItem, Math.floor(Number(n) || 1))); qtyEl.value = qty; updatePrice(); };
  $$("[data-q]").forEach((b) => b.addEventListener("click", () => setQty(qty + Number(b.dataset.q))));
  qtyEl.addEventListener("change", () => setQty(qtyEl.value));
  $("#buyForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (cart.add(p.slug, sel, qty)) toast(`<b>${esc(p.name)}</b> × ${qty} added 🫧 <a href="cart.html">View cart →</a>`);
  });
  $$(".pdp__thumbs button").forEach((b) => b.addEventListener("click", () => { $("#pdpStage img").src = b.dataset.img; }));
  const art = $("#pdpStage .slime-art");
  art.addEventListener("pointerdown", () => { art.classList.remove("squish"); void art.offsetWidth; art.classList.add("squish"); });
  void priceEl;

  // Sticky add-to-cart bar on phones when the main button scrolls away.
  if (!out) {
    const bar = document.createElement("div");
    bar.className = "buybar";
    bar.innerHTML = `<div><b>${esc(p.name)}</b><span data-bar-price>${pkr(unitPrice(p, sel) * qty)}</span></div><button class="btn btn--pink" type="button">Add to cart</button>`;
    document.body.append(bar);
    bar.querySelector("button").addEventListener("click", () => $("#buyForm").requestSubmit());
    const syncBar = () => { bar.querySelector("[data-bar-price]").textContent = pkr(unitPrice(p, sel) * qty); };
    $("#buyForm").addEventListener("change", syncBar);
    $$("[data-q]").forEach((b) => b.addEventListener("click", syncBar));
    new IntersectionObserver(([en]) => {
      const show = !en.isIntersecting && en.boundingClientRect.top < 0;
      bar.classList.toggle("show", show);
      document.body.classList.toggle("has-buybar", show);
    }).observe($('#buyForm button[type="submit"]'));
  }

  setWidgetContext({ label: `Ask about ${p.name}`, msg: `Hi! I have a question about ${p.name}: ${url}` });

  // Related
  const rel = inCategory(p.category).filter((x) => x.slug !== p.slug);
  const more = rel.length < 4 ? products.filter((x) => x.slug !== p.slug && x.category !== p.category && x.bestSeller) : [];
  $("#relatedGrid").innerHTML = [...rel, ...more].slice(0, 4).map(productCard).join("");
  $("#related").hidden = false;
  refreshReveal();

  // Structured data from real catalog values only (no ratings or reviews).
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify([{
    "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description, sku: p.slug,
    category: cat?.name, url, ...(p.images?.length ? { image: p.images.map((i) => `${CONFIG.siteUrl}/${i}`) } : {}),
    brand: { "@type": "Brand", name: CONFIG.storeName },
    offers: { "@type": "Offer", priceCurrency: CONFIG.currency, price: p.price, url,
      availability: out ? "https://schema.org/OutOfStock" : p.stock === "low" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock" },
  }, {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: CONFIG.siteUrl + "/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: CONFIG.siteUrl + "/shop.html" },
      { "@type": "ListItem", position: 3, name: p.name, item: url },
    ],
  }]);
  document.head.append(ld);
}

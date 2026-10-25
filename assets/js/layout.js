import { CONFIG } from "./config.js?v=202610251319";
import { cart } from "./cart.js?v=202610251319";
import { getProduct } from "./catalog.js?v=202610251319";
import { $, $$, esc, toast, reducedMotion, shippingText } from "./utils.js?v=202610251319";
import { initWidget, WA_ICON } from "./whatsapp.js?v=202610251319";
import { openQuickView } from "./quickview.js?v=202610251319";

// Main navigation, matching the client's theme.
const NAV = [
  ["index.html", "Home"],
  ["shop.html", "Gallery"],
  ["orders.html", "Orders"],
  ["care.html", "Care"],
  ["index.html#craft", "Craft"],
  ["index.html#love", "Love"],
  ["index.html#order", "Order"],
];

const ICONS = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/></svg>',
};

const logo = (size) => `<img src="assets/img/logo-128.webp" width="${size}" height="${size}" alt="" decoding="async">`;

function header(page) {
  const links = NAV.map(([href, label]) =>
    `<a href="${href}"${href === page ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  return `
  <div class="topbar">
    <a class="logo" href="index.html">${logo(52)}<span class="logo__text">${esc(CONFIG.storeName)}</span></a>
    <nav class="dock" id="navLinks" aria-label="Main">${links}</nav>
    <div class="topbar__actions">
      <button class="icon-btn" type="button" id="searchOpen" aria-label="Search slimes">${ICONS.search}</button>
      <a class="icon-btn cart-btn" href="cart.html"><span class="sr-only">Cart, items:</span>${ICONS.bag}<span class="cart-btn__count" data-cart-count>0</span></a>
      <button class="icon-btn nav__burger" type="button" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">${ICONS.menu}</button>
    </div>
  </div>
  <div class="search" id="search" hidden>
    <form class="search__box" action="shop.html" role="search">
      <label class="sr-only" for="searchInput">Search slimes</label>
      <input id="searchInput" name="q" type="search" placeholder="Search slimes, e.g. cloud" autocomplete="off">
      <button class="btn btn--pink" type="submit">Search</button>
      <button class="icon-btn" type="button" id="searchClose" aria-label="Close search">✕</button>
    </form>
  </div>`;
}

function footer() {
  const insta = CONFIG.instagram
    ? `<a class="footer__icon" href="${esc(CONFIG.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>` : "";
  return `
  <div class="footer__inner container">
    <div class="footer__brand">
      <a class="logo" href="index.html">${logo(56)}<span><b>${esc(CONFIG.storeName)}</b><small>Handmade sensory slime studio · ${esc(CONFIG.city)}, ${esc(CONFIG.country)}</small></span></a>
    </div>
    <nav class="footer__links" aria-label="Footer">
      <a href="shop.html">The Lab</a><a href="index.html#craft">Craft</a><a href="index.html#order">Order</a><a href="care.html">Care</a>
      <a href="faq.html">FAQ</a><a href="shipping.html">Delivery</a><a href="returns.html">Returns</a><a href="contact.html">Contact</a>
      ${insta}
      <a class="footer__wa" href="#" data-open-wa>${WA_ICON} WhatsApp</a>
    </nav>
  </div>
  <div class="footer__base container">
    <p>© ${new Date().getFullYear()} ${esc(CONFIG.storeName)}. All rights reserved.</p>
    <p><a href="orders.html">My orders</a> · <a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a></p>
  </div>`;
}

export function updateCartCount() {
  const n = cart.summary().count;
  $$("[data-cart-count]").forEach((el) => {
    el.textContent = n;
    el.hidden = n === 0; // no badge on an empty cart
    el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
  });
}

function initReveal() {
  const els = $$(".reveal:not(.in)");
  if (reducedMotion() || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
  const show = (el) => { el.classList.add("in"); io.unobserve(el); };
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    // Reveal when visible, or when the user has already scrolled past it.
    if (en.isIntersecting || en.boundingClientRect.top < 0) show(en.target);
  }), { rootMargin: "0px 0px -8% 0px" });
  els.forEach((e) => io.observe(e));
  // Safety net for slow devices: anything above the bottom of the screen shows after a scroll pause.
  let t;
  addEventListener("scroll", () => {
    clearTimeout(t);
    t = setTimeout(() => $$(".reveal:not(.in)").forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) show(el); }), 150);
  }, { passive: true });
}
export const refreshReveal = initReveal;

export function initLayout(page) {
  $("#site-header").innerHTML = header(page);
  // Cart and checkout keep the screen clear for buying; WhatsApp stays in the footer there.
  document.body.classList.toggle("page-buy", ["cart.html", "checkout.html"].includes(page));
  $("#site-footer").innerHTML = footer();
  initWidget();

  const menuBtn = $("#menuBtn"), links = $("#navLinks");
  menuBtn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });
  links.addEventListener("click", (e) => { if (e.target.closest("a")) { links.classList.remove("open"); document.body.classList.remove("menu-open"); menuBtn.setAttribute("aria-expanded", "false"); } });

  const search = $("#search");
  const setSearch = (open) => { search.hidden = !open; if (open) $("#searchInput").focus(); };
  $("#searchOpen").addEventListener("click", () => setSearch(search.hidden));
  $("#searchClose").addEventListener("click", () => setSearch(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setSearch(false); });

  const hdr = $("#site-header");
  const onScroll = () => hdr.classList.toggle("scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Any [data-add] button adds that product with default options.
  document.addEventListener("click", (e) => {
    const qv = e.target.closest("[data-quick]");
    if (qv) { openQuickView(qv.dataset.quick); return; }
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const p = getProduct(btn.dataset.add);
    if (p && cart.add(p.slug)) toast(`<b>${esc(p.name)}</b> added 🫧 <a href="cart.html">View cart →</a>`);
  });

  // Fill config values into static pages: <span data-cfg="whatsapp">.
  const cfg = { whatsapp: CONFIG.whatsappDisplay, fee: shippingText(), store: CONFIG.storeName, email: CONFIG.storeEmail || "our WhatsApp" };
  $$("[data-cfg]").forEach((el) => { el.textContent = cfg[el.dataset.cfg] ?? ""; });

  window.addEventListener("cart:change", updateCartCount);
  updateCartCount();
  initReveal();
}

import { CONFIG } from "./config.js";
import { cart } from "./cart.js";
import { getProduct } from "./catalog.js";
import { $, $$, esc, toast, reducedMotion, shippingText } from "./utils.js";
import { initWidget, WA_ICON } from "./whatsapp.js";
import { openQuickView } from "./quickview.js";

const NAV = [
  ["index.html", "Home"],
  ["shop.html", "Shop all"],
  ["index.html#collections", "Collections"],
  ["shop.html?flag=best", "Best sellers"],
  ["shop.html?flag=new", "New drops"],
  ["about.html", "About"],
  ["faq.html", "FAQ"],
  ["contact.html", "Contact"],
];

const MARQUEE = ["handmade slime", "squish it", "order on WhatsApp", "no card needed", "stretch it", "new drops", "loud colors", "delivery in Pakistan"];

function header(page) {
  const links = NAV.map(([href, label]) => {
    const active = (href === page) ? ' aria-current="page"' : "";
    return `<a href="${href}"${active}>${label}</a>`;
  }).join("");
  const words = MARQUEE.map((w) => `<span>${w}</span><span class="marquee__star">✦</span>`).join("");
  return `
  <div class="marquee" aria-hidden="true"><div class="marquee__track">${words}${words}</div></div>
  <div class="nav">
    <a class="logo" href="index.html" aria-label="${esc(CONFIG.storeName)} home">
      <span class="logo__blob" aria-hidden="true"></span><span class="logo__text">abi's<br>slime lab</span>
    </a>
    <nav class="nav__links" id="navLinks" aria-label="Main">${links}</nav>
    <div class="nav__actions">
      <button class="icon-btn" type="button" id="searchOpen" aria-label="Search slimes">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>
      </button>
      <a class="cart-pill" href="cart.html" aria-label="Cart">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l-1.4 11.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8L5 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
        <span class="cart-pill__count" data-cart-count>0</span>
      </a>
      <button class="icon-btn nav__burger" type="button" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <div class="search" id="search" hidden>
    <form class="search__box" action="shop.html" role="search">
      <label class="sr-only" for="searchInput">Search slimes</label>
      <input id="searchInput" name="q" type="search" placeholder="Search slimes… try “cloud”" autocomplete="off">
      <button class="btn btn--pink" type="submit">Search</button>
      <button class="icon-btn" type="button" id="searchClose" aria-label="Close search">✕</button>
    </form>
  </div>`;
}

function footer() {
  const socials = [["instagram", "Instagram"], ["tiktok", "TikTok"], ["facebook", "Facebook"]]
    .filter(([k]) => CONFIG[k]).map(([k, l]) => `<a href="${esc(CONFIG[k])}" target="_blank" rel="noopener">${l}</a>`).join("");
  return `
  <div class="wave footer__drip" aria-hidden="true"></div>
  <div class="footer__inner container">
    <div class="footer__brand">
      <p class="footer__word">abi's<br>slime lab</p>
      <p>Handmade slime in loud colors and dreamy textures. Order online, confirm on WhatsApp.</p>
      <button class="btn btn--wa" type="button" data-open-wa>${WA_ICON} Chat on WhatsApp</button>
    </div>
    <nav class="footer__col" aria-label="Shop"><h2>Shop</h2>
      <a href="shop.html">All slimes</a><a href="shop.html?flag=best">Best sellers</a><a href="shop.html?flag=new">New drops</a><a href="index.html#collections">Collections</a></nav>
    <nav class="footer__col" aria-label="Help"><h2>Help</h2>
      <a href="orders.html">My orders</a><a href="faq.html">FAQ</a><a href="shipping.html">Shipping &amp; delivery</a><a href="returns.html">Returns</a><a href="contact.html">Contact</a></nav>
    <div class="footer__col"><h2>Say hi</h2>
      <a href="#" data-open-wa>WhatsApp ${esc(CONFIG.whatsappDisplay)}</a>
      ${CONFIG.storeEmail ? `<a href="mailto:${esc(CONFIG.storeEmail)}">${esc(CONFIG.storeEmail)}</a>` : ""}
      ${socials}
    </div>
  </div>
  <div class="footer__base container">
    <p>© ${new Date().getFullYear()} ${esc(CONFIG.storeName)}</p>
    <p><a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a></p>
  </div>`;
}

export function updateCartCount() {
  const n = cart.summary().count;
  $$("[data-cart-count]").forEach((el) => {
    el.textContent = n;
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

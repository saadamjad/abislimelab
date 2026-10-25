import { CONFIG } from "../config.js?v=202610260051";
import { esc, pkr, shippingText } from "../utils.js?v=202610260051";

export function faqText(s) {
  return s.replaceAll("{fee}", shippingText()).replaceAll("{whatsapp}", CONFIG.whatsappDisplay);
}
export function renderFaqs(el, list) {
  el.innerHTML = list.map((f) => `<details class="faq reveal"><summary>${esc(f.q)}<span aria-hidden="true">+</span></summary><p>${esc(faqText(f.a))}</p></details>`).join("");
}
export function faqJsonLd(list) {
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: list.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: faqText(f.a) } })),
  });
  document.head.append(s);
}

export function summaryBox(s, { cta = true } = {}) {
  const { freeOver } = CONFIG.shipping;
  const gap = freeOver > 0 && s.subtotal < freeOver ? `<p class="sum__hint">Add ${pkr(freeOver - s.subtotal)} more for free delivery 🎉</p>` : "";
  return `<aside class="sum" aria-label="Order summary">
    <h2>Summary</h2>
    <dl>
      <div><dt>Subtotal</dt><dd>${pkr(s.subtotal)}</dd></div>
      <div><dt>Delivery</dt><dd>${s.subtotal ? (s.shipping ? pkr(s.shipping) : "Free") : "–"}</dd></div>
      <div class="sum__total"><dt>Total</dt><dd>${pkr(s.total)}</dd></div>
    </dl>
    ${gap}
    ${cta ? `<a class="btn btn--pink btn--lg btn--block ${s.hasUnavailable || !s.count ? "btn--disabled" : ""}" href="checkout.html" ${s.hasUnavailable || !s.count ? 'aria-disabled="true" tabindex="-1"' : ""}>Checkout →</a>
    ${s.hasUnavailable ? '<p class="sum__warn" role="alert">Remove sold-out items to continue.</p>' : ""}
    <p class="sum__note">No card needed. You'll confirm your order on WhatsApp.</p>` : ""}
  </aside>`;
}


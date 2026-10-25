import { initLayout } from "../layout.js?v=202610251319";
import { CONFIG } from "../config.js?v=202610251319";
import { cart } from "../cart.js?v=202610251319";
import { slimeArt } from "../catalog.js?v=202610251319";
import { saveOrder, getOrder } from "../orders.js?v=202610251319";
import { $, $$, esc, pkr, normalizePkPhone, formatPkPhone, isEmail, newOrderRef, store } from "../utils.js?v=202610251319";
import { summaryBox } from "./shared.js?v=202610251319";

initLayout("checkout.html");
const form = $("#checkoutForm");
const DRAFT = "asl_checkout_draft";

// City and province options
$("#city").innerHTML = `<option value="">Choose your city</option>` + CONFIG.cities.map((c) => `<option>${esc(c)}</option>`).join("") + `<option value="__other">Other</option>`;
$("#province").innerHTML = `<option value="">Choose province / region</option>` + CONFIG.provinces.map((c) => `<option>${esc(c)}</option>`).join("");
$("#city").addEventListener("change", () => { $("#cityOtherWrap").hidden = $("#city").value !== "__other"; });

// Restore a draft (not the email-free fields only; everything stays on this device).
const draft = store.get(DRAFT, {});
for (const [k, v] of Object.entries(draft)) { const el = form.elements[k]; if (el && el.type !== "checkbox") el.value = v; }
$("#cityOtherWrap").hidden = $("#city").value !== "__other";
form.addEventListener("input", () => {
  const d = {}; for (const el of form.elements) if (el.name && el.type !== "checkbox") d[el.name] = el.value;
  store.set(DRAFT, d); renderReview();
});

function renderSummary() {
  const s = cart.summary();
  if (!s.count) {
    $("#checkoutRoot").innerHTML = `<div class="empty"><p class="empty__emoji" aria-hidden="true">🫙</p><h2>Your cart is empty</h2><p>Add a slime or two before checking out.</p><a class="btn btn--pink btn--lg" href="shop.html">Shop slimes</a></div>`;
    return null;
  }
  $("#orderItems").innerHTML = s.lines.map((l) => l.product ? `
    <li class="mini ${l.unavailable ? "line--bad" : ""}">${slimeArt(l.product)}
      <div><b>${esc(l.product.name)}</b>${l.variant ? `<small>${esc(l.variant)}</small>` : ""}<small>Qty ${l.qty} × ${pkr(l.unitPrice)}</small>${l.unavailable ? `<small class="line__warn">${esc(l.reason)}</small>` : ""}</div>
      <span>${l.unavailable ? "–" : pkr(l.lineTotal)}</span></li>` : `<li class="mini line--bad"><div><b>Unavailable item</b><small class="line__warn">${esc(l.reason)}</small></div></li>`).join("");
  $("#sumBox").innerHTML = summaryBox(s, { cta: false });
  $("#placeBtn").textContent = `Place order · ${pkr(s.total)}`;
  return s;
}

function cityValue() { return $("#city").value === "__other" ? $("#cityOther").value.trim() : $("#city").value; }

function renderReview() {
  const f = form.elements;
  const phone = normalizePkPhone(f.phone.value);
  const lines = [f.fullName.value.trim(), [f.address.value.trim(), f.apartment.value.trim()].filter(Boolean).join(", "),
    [cityValue(), f.province.value, f.postal.value.trim()].filter(Boolean).join(", "), phone ? formatPkPhone(phone) : f.phone.value.trim(), f.email.value.trim()].filter(Boolean);
  $("#review").innerHTML = lines.length ? lines.map((l) => `<span>${esc(l)}</span>`).join("") : "<span>Fill in your details and they'll show up here.</span>";
}

const RULES = {
  fullName: (v) => v.trim().length >= 2 || "Please enter your full name.",
  email: (v) => isEmail(v) || "Please enter a valid email, like name@example.com.",
  phone: (v) => !!normalizePkPhone(v) || "Enter a Pakistani mobile number, like 0333 1234567.",
  address: (v) => v.trim().length >= 8 || "Please enter your full street address.",
  city: (v) => !!v || "Please choose your city.",
  cityOther: (v) => $("#city").value !== "__other" || v.trim().length >= 2 || "Please type your city.",
  province: (v) => !!v || "Please choose your province or region.",
  postal: (v) => !v.trim() || /^\d{5}$/.test(v.trim()) || "Postal codes in Pakistan have 5 digits.",
  agree: (_, el) => el.checked || "Please confirm you've read how ordering works.",
};

function validate() {
  let first = null;
  for (const [name, rule] of Object.entries(RULES)) {
    const el = form.elements[name];
    const res = rule(el.value, el);
    const err = $(`#err-${name}`);
    if (res !== true) {
      el.setAttribute("aria-invalid", "true"); err.textContent = res; first ||= el;
    } else { el.removeAttribute("aria-invalid"); err.textContent = ""; }
  }
  return first;
}
$$("input, select, textarea", form).forEach((el) => el.addEventListener("blur", () => {
  const rule = RULES[el.name]; if (!rule || !el.value) return;
  const res = rule(el.value, el); $(`#err-${el.name}`).textContent = res === true ? "" : res;
  res === true ? el.removeAttribute("aria-invalid") : el.setAttribute("aria-invalid", "true");
}));

let submitting = false;
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (submitting) return;
  const bad = validate();
  const banner = $("#formError");
  if (bad) { banner.textContent = "Please fix the highlighted fields."; banner.hidden = false; bad.focus(); return; }
  const s = cart.summary();
  if (!s.count || s.hasUnavailable) { banner.textContent = "Some items in your cart are unavailable. Please update your cart."; banner.hidden = false; return; }
  banner.hidden = true;

  // Duplicate guard: the same cart + email submitted again opens the existing order.
  const f = form.elements;
  const fingerprint = JSON.stringify([cart.raw(), f.email.value.trim().toLowerCase()]);
  const last = store.get("asl_last_submit", null);
  if (last && last.fp === fingerprint && getOrder(last.ref)) { location.replace(`order.html?ref=${last.ref}`); return; }

  submitting = true;
  const btn = $("#placeBtn"); btn.disabled = true; btn.textContent = "Placing your order…";

  const order = {
    ref: newOrderRef(),
    createdAt: new Date().toISOString(),
    currency: CONFIG.currency,
    customer: {
      name: f.fullName.value.trim(), email: f.email.value.trim(), phone: normalizePkPhone(f.phone.value),
      address: f.address.value.trim(), apartment: f.apartment.value.trim(), city: cityValue(),
      province: f.province.value, postal: f.postal.value.trim(), notes: f.notes.value.trim(),
    },
    items: s.lines.map((l) => ({ slug: l.slug, name: l.product.name, variant: l.variant, qty: l.qty, unitPrice: l.unitPrice, lineTotal: l.lineTotal })),
    subtotal: s.subtotal, shipping: s.shipping, discount: s.discount, total: s.total,
    orderStatus: "Awaiting WhatsApp confirmation",
    paymentStatus: "Unpaid",
    emails: { status: "pending" },
  };

  if (!saveOrder(order) || !getOrder(order.ref)) {
    submitting = false; btn.disabled = false; renderSummary();
    banner.textContent = "We couldn't save your order on this device. Please allow site storage or try another browser. Your cart is still here.";
    banner.hidden = false; return;
  }
  store.set("asl_last_submit", { fp: fingerprint, ref: order.ref });
  cart.clear();
  try { localStorage.removeItem(DRAFT); } catch {}
  location.replace(`order.html?ref=${order.ref}`);
});

window.addEventListener("cart:change", () => { if (!submitting) renderSummary(); });
if (renderSummary()) renderReview();

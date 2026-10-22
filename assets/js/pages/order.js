import { initLayout } from "../layout.js?v=202610230304";
import { CONFIG } from "../config.js?v=202610230304";
import { getOrder, saveOrder } from "../orders.js?v=202610230304";
import { loadPdfLib, buildInvoice, invoiceFileName } from "../invoice.js?v=202610230304";
import { sendOrderEmails, emailConfigured } from "../email.js?v=202610230304";
import { waLink, orderMessage, WA_ICON } from "../whatsapp.js?v=202610230304";
import { $, esc, pkr, formatDate, formatPkPhone, copyText, toast, reducedMotion } from "../utils.js?v=202610230304";

initLayout("order.html");
const root = $("#orderRoot");
let sendingNow = false;
const ref = new URLSearchParams(location.search).get("ref") || "";
const order = /^ASL-[A-Z0-9]{8}$/.test(ref) ? getOrder(ref) : null;

if (!order) {
  root.innerHTML = `<div class="empty"><p class="empty__emoji" aria-hidden="true">🔎</p><h1>We can't find that order here</h1>
    <p>Order pages are saved only on the device where the order was placed. If you placed an order, message us with your order reference and we'll help.</p>
    <a class="btn btn--wa btn--lg" href="${esc(waLink("Hi! I need help with my order. My reference is: " + ref))}" target="_blank" rel="noopener">${WA_ICON} Message us on WhatsApp</a></div>`;
} else {
  render();
  handleEmails();
}

function render() {
  const c = order.customer;
  const wa = waLink(orderMessage(order));
  root.innerHTML = `
  <section class="ok-hero">
    <div class="confetti" aria-hidden="true">${"<i></i>".repeat(reducedMotion() ? 0 : 18)}</div>
    <p class="sticker sticker--lime">Order placed 🎉</p>
    <h1>Your order has been placed successfully!</h1>
    <p class="ok-hero__lead">To complete your order confirmation, please download your invoice and send it to our official WhatsApp number. Our team will review your order and confirm the next steps.</p>
    <p class="ok-ref">Order reference <b id="refTxt">${esc(order.ref)}</b> <button type="button" class="link-btn" id="copyRef">Copy</button></p>
  </section>

  <section class="confirm-card" aria-labelledby="stepsTitle">
    <h2 id="stepsTitle">Confirm in 3 easy steps</h2>
    <ol class="confirm-steps">
      <li><span class="num">1</span><div><b>Download your invoice</b><p>Save the PDF to your phone or computer.</p>
        <button class="btn btn--ink btn--lg" type="button" id="dlBtn" disabled>Download Invoice (PDF)</button>
        <div class="row-links"><button type="button" class="link-btn" id="viewBtn" disabled>View invoice</button><button type="button" class="link-btn" id="printBtn" disabled>Print invoice</button></div>
        <p class="pdf-status" id="pdfStatus" role="status">Preparing your invoice…</p></div></li>
      <li><span class="num">2</span><div><b>Open WhatsApp</b><p>Your order details will be typed for you. Check them and press send.</p>
        <a class="btn btn--wa btn--lg" href="${esc(wa)}" target="_blank" rel="noopener">${WA_ICON} Send Order Details on WhatsApp</a></div></li>
      <li><span class="num">3</span><div><b>Attach the invoice PDF</b><p>WhatsApp can't attach files automatically. In the chat, tap the 📎 attach button, choose <b>Document</b> and pick <b>${esc(invoiceFileName(order))}</b>.</p></div></li>
    </ol>
    <div class="wa-number">
      <span>Our official WhatsApp<b>${esc(CONFIG.whatsappDisplay)}</b></span>
      <button type="button" class="btn btn--sm" id="copyWa">Copy number</button>
    </div>
    <p class="fine">Opening WhatsApp doesn't send anything by itself. Your order is confirmed only after our team replies.</p>
  </section>

  <section class="order-grid">
    <div class="panel">
      <h2>Order summary</h2>
      <ul class="mini-list">${order.items.map((i) => `<li><div><b>${esc(i.name)}</b>${i.variant ? `<small>${esc(i.variant)}</small>` : ""}<small>Qty ${i.qty} × ${pkr(i.unitPrice)}</small></div><span>${pkr(i.lineTotal)}</span></li>`).join("")}</ul>
      <dl class="totals">
        <div><dt>Subtotal</dt><dd>${pkr(order.subtotal)}</dd></div>
        <div><dt>Delivery</dt><dd>${order.shipping ? pkr(order.shipping) : "Free"}</dd></div>
        <div class="sum__total"><dt>Total</dt><dd>${pkr(order.total)}</dd></div>
      </dl>
    </div>
    <div class="panel">
      <h2>Status</h2>
      <dl class="status-list">
        <div><dt>Order status</dt><dd><span class="pill pill--wait">${esc(order.orderStatus)}</span></dd></div>
        <div><dt>Payment status</dt><dd><span class="pill pill--unpaid">${esc(order.paymentStatus)}</span></dd></div>
        <div><dt>Placed on</dt><dd>${esc(formatDate(order.createdAt))}</dd></div>
        <div><dt>Emails</dt><dd id="emailStatus">${emailText()}</dd></div>
      </dl>
      <h3>Delivering to</h3>
      <p class="addr">${esc(c.name)}<br>${esc([c.address, c.apartment].filter(Boolean).join(", "))}<br>${esc([c.city, c.province, c.postal].filter(Boolean).join(", "))}, ${esc(CONFIG.country)}<br>${esc(formatPkPhone(c.phone))} · ${esc(c.email)}</p>
      ${c.notes ? `<h3>Notes</h3><p class="addr">${esc(c.notes)}</p>` : ""}
    </div>
  </section>
  <p class="fine center">This page is saved on this device. Keep your invoice PDF as your copy of the order.</p>
  <p class="center"><a class="btn" href="shop.html">Keep shopping</a></p>`;

  $("#copyRef").addEventListener("click", async () => toast((await copyText(order.ref)) ? "Order reference copied" : "Couldn't copy"));
  $("#copyWa").addEventListener("click", async () => toast((await copyText(CONFIG.whatsappDisplay)) ? "WhatsApp number copied 📋" : "Couldn't copy"));
  initPdf();
}

async function initPdf() {
  const status = $("#pdfStatus");
  try {
    const jsPDF = await loadPdfLib();
    const make = () => buildInvoice(order, jsPDF);
    make(); // fail early if something is wrong
    ["dlBtn", "viewBtn", "printBtn"].forEach((id) => { $("#" + id).disabled = false; });
    status.textContent = "";
    $("#dlBtn").addEventListener("click", () => { make().save(invoiceFileName(order)); toast("Invoice downloaded 🧾 Now send it on WhatsApp."); });
    $("#viewBtn").addEventListener("click", () => { window.open(make().output("bloburl"), "_blank", "noopener"); });
    $("#printBtn").addEventListener("click", () => { const d = make(); d.autoPrint(); window.open(d.output("bloburl"), "_blank", "noopener"); });
  } catch (err) {
    console.error(err);
    status.innerHTML = `We couldn't create the PDF right now. Check your internet connection and <a href="">reload this page</a>. You can still send your order on WhatsApp.`;
  }
}

function emailText() {
  const e = order.emails || {};
  if (e.status === "pending" || e.status === "sending") {
    if (!emailConfigured()) return "Email confirmation is not set up yet.";
    return sendingNow ? "Sending confirmation email…" : "We couldn't confirm whether the email was sent. Your order is still saved here.";
  }
  if (e.status === "off") return "Email confirmation is not set up yet.";
  const parts = [];
  if (e.customer === "sent") parts.push(`Confirmation sent to ${esc(order.customer.email)}`);
  if (e.customer === "failed") parts.push("We couldn't send your confirmation email. Your order is still saved here.");
  if (e.admin === "failed") parts.push("The store wasn't notified by email, so please make sure to message us on WhatsApp.");
  return parts.join("<br>") || "Email confirmation is not set up yet.";
}

async function handleEmails() {
  const e = order.emails || {};
  // Send once. A refresh during sending will not send again.
  if (e.status !== "pending") return;
  if (!emailConfigured()) { order.emails = { status: "off" }; saveOrder(order); $("#emailStatus").innerHTML = emailText(); return; }
  order.emails = { status: "sending" }; saveOrder(order);
  sendingNow = true; $("#emailStatus").innerHTML = emailText();
  const res = await sendOrderEmails(order);
  sendingNow = false;
  order.emails = { status: "done", ...res, at: new Date().toISOString() };
  saveOrder(order);
  $("#emailStatus").innerHTML = emailText();
}

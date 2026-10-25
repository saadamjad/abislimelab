/* Order emails through EmailJS (no server needed). Templates are set up in the EmailJS dashboard; see README. */
import { CONFIG } from "./config.js?v=202610260106";
import { loadScript, pkr, formatDate, formatPkPhone } from "./utils.js?v=202610260106";
import { waLink, orderMessage } from "./whatsapp.js?v=202610260106";

const SDK = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4.4.1/dist/email.min.js";

export const emailConfigured = () => {
  const e = CONFIG.emailjs;
  return Boolean(e.publicKey && e.serviceId && (e.customerTemplateId || e.adminTemplateId));
};

function params(order) {
  const c = order.customer;
  const itemsText = order.items.map((i) => `${i.name}${i.variant ? " (" + i.variant + ")" : ""} x${i.qty} @ ${pkr(i.unitPrice)} = ${pkr(i.lineTotal)}`).join("\n");
  return {
    store_name: CONFIG.storeName,
    order_ref: order.ref,
    order_date: formatDate(order.createdAt),
    order_status: order.orderStatus,
    payment_status: order.paymentStatus,
    customer_name: c.name,
    customer_email: c.email,
    customer_phone: formatPkPhone(c.phone),
    delivery_address: [c.address, c.apartment, c.city, c.province, c.postal, CONFIG.country].filter(Boolean).join(", "),
    order_notes: c.notes || "None",
    items: itemsText,
    subtotal: pkr(order.subtotal),
    shipping: order.shipping ? pkr(order.shipping) : "Free",
    total: pkr(order.total),
    whatsapp_number: CONFIG.whatsappDisplay,
    whatsapp_link: waLink(orderMessage(order)),
    order_page: `${CONFIG.siteUrl}/order.html?ref=${order.ref}`,
    admin_email: CONFIG.adminEmail,
  };
}

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);

/** Returns { customer, admin } with "sent" | "failed" | "off". Never throws. */
export async function sendOrderEmails(order) {
  const e = CONFIG.emailjs;
  const result = { customer: "off", admin: "off" };
  if (!emailConfigured()) return result;
  try { await loadScript(SDK); } catch { return { customer: e.customerTemplateId ? "failed" : "off", admin: e.adminTemplateId ? "failed" : "off" }; }
  const p = params(order);
  const send = async (template, extra) => {
    if (!template) return "off";
    for (let attempt = 0; attempt < 2; attempt++) {
      try { await withTimeout(window.emailjs.send(e.serviceId, template, { ...p, ...extra }, { publicKey: e.publicKey }), 15000); return "sent"; }
      catch (err) { console.warn("Email attempt failed", err?.status || err?.message); }
    }
    return "failed";
  };
  [result.customer, result.admin] = await Promise.all([
    send(e.customerTemplateId, { to_email: order.customer.email, to_name: order.customer.name }),
    CONFIG.adminEmail ? send(e.adminTemplateId, { to_email: CONFIG.adminEmail, to_name: CONFIG.storeName }) : Promise.resolve("off"),
  ]);
  return result;
}

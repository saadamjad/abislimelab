import { CONFIG } from "./config.js";
import { $, esc, pkr, copyText, toast } from "./utils.js";

export const waLink = (text = "") =>
  `https://wa.me/${CONFIG.whatsappNumber}${text ? "?text=" + encodeURIComponent(text) : ""}`;

export function orderMessage(order) {
  const items = order.items.map((i) => `- ${i.name}${i.variant ? " (" + i.variant + ")" : ""} x${i.qty}`).join("\n");
  return `Hello! I have placed order ${order.ref}. My name is ${order.customer.name}.\n` +
    `My order total is ${pkr(order.total)}.\n\n${items}\n\nI am sharing my invoice for confirmation.`;
}

const WA_ICON = `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16 3C9.1 3 3.5 8.6 3.5 15.5c0 2.4.7 4.6 1.8 6.5L3 29l7.2-2.3A12.4 12.4 0 0 0 16 28c6.9 0 12.5-5.6 12.5-12.5S22.9 3 16 3Zm0 22.7c-1.9 0-3.7-.5-5.2-1.4l-.4-.2-4.3 1.3 1.4-4.2-.2-.4a10.2 10.2 0 0 1-1.6-5.3C5.7 9.9 10.3 5.3 16 5.3s10.3 4.6 10.3 10.2-4.6 10.2-10.3 10.2Zm5.7-7.7c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.2-.2.2-.3.3-.5.1-.2.1-.4 0-.5l-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.2 2.2 3.3 5.3 4.7.7.3 1.3.5 1.8.7.7.2 1.4.2 2 .1.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.4Z"/></svg>`;
export { WA_ICON };

const QUICK = [
  { label: "Ask about a slime", msg: `Hi ${CONFIG.storeName}! I have a question about a slime.` },
  { label: "Custom / bulk order", msg: "Hi! I'd like to place a custom or bulk slime order." },
  { label: "Track my order", msg: "Hi! I'd like an update on my order. My order reference is: " },
  { label: "Delivery & shipping", msg: "Hi! Do you deliver to my city, and what are the charges?" },
  { label: "Something else", msg: `Hi ${CONFIG.storeName}, I have a question.` },
];

let ctx = null; // optional product-specific quick message

export function setWidgetContext(item) { ctx = item; renderList(); }

function renderList() {
  const list = $("#waList");
  if (!list) return;
  const items = ctx ? [ctx, ...QUICK] : QUICK;
  list.innerHTML = items.map((q, i) =>
    `<a class="wa-msg${ctx && i === 0 ? " wa-msg--ctx" : ""}" href="${esc(waLink(q.msg))}" target="_blank" rel="noopener">${esc(q.label)}<span aria-hidden="true">→</span></a>`).join("");
}

export function initWidget() {
  const fab = document.createElement("button");
  fab.className = "wa-fab";
  fab.id = "waFab";
  fab.type = "button";
  fab.setAttribute("aria-label", "Chat with us on WhatsApp");
  fab.setAttribute("aria-expanded", "false");
  fab.setAttribute("aria-controls", "waPanel");
  fab.innerHTML = WA_ICON;

  const panel = document.createElement("div");
  panel.className = "wa-panel";
  panel.id = "waPanel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "WhatsApp quick messages");
  panel.hidden = true;
  panel.innerHTML = `
    <div class="wa-panel__head">
      <span class="wa-panel__avatar" aria-hidden="true">🧪</span>
      <div><strong>${esc(CONFIG.storeName)}</strong><small><i class="wa-dot" aria-hidden="true"></i>${esc(CONFIG.whatsappReplyNote)}</small></div>
      <button class="wa-panel__close" type="button" aria-label="Close WhatsApp panel">✕</button>
    </div>
    <div class="wa-panel__bubble">Hey there! 👋 What can we help you with? Pick a topic and we'll open WhatsApp with your message ready.</div>
    <nav class="wa-panel__list" id="waList" aria-label="Quick messages"></nav>
    <div class="wa-panel__foot">
      <span>WhatsApp <b>${esc(CONFIG.whatsappDisplay)}</b></span>
      <button type="button" class="wa-copy">Copy</button>
    </div>`;
  document.body.append(panel, fab);
  renderList();

  const open = (state) => {
    panel.hidden = !state;
    fab.setAttribute("aria-expanded", String(state));
    fab.classList.toggle("is-open", state);
    if (state) panel.querySelector(".wa-msg")?.focus();
  };
  fab.addEventListener("click", () => open(panel.hidden));
  panel.querySelector(".wa-panel__close").addEventListener("click", () => { open(false); fab.focus(); });
  panel.querySelector(".wa-copy").addEventListener("click", async () => {
    toast((await copyText(CONFIG.whatsappDisplay)) ? "WhatsApp number copied 📋" : "Couldn't copy. The number is " + esc(CONFIG.whatsappDisplay));
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { open(false); fab.focus(); } });
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-wa]")) { e.preventDefault(); open(true); return; }
    if (!panel.hidden && !panel.contains(e.target) && !fab.contains(e.target)) open(false);
  });
}

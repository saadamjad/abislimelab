/* Real PDF invoices, generated in the browser with jsPDF from the saved order. */
import { CONFIG } from "./config.js?v=202610251319";
import { loadScript, pkr, formatDate, formatPkPhone } from "./utils.js?v=202610251319";

const JSPDF = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
export const loadPdfLib = () => loadScript(JSPDF).then(() => window.jspdf.jsPDF);

const INK = [26, 45, 66], PINK = [214, 40, 110], LIME = [241, 255, 220], GREY = [96, 108, 124];

export function buildInvoice(order, jsPDF) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 16, CW = W - M * 2;
  let y = 0;

  const text = (s, x, yy, o = {}) => doc.text(String(s), x, yy, o);
  const font = (style = "normal", size = 10, color = INK) => { doc.setFont("helvetica", style); doc.setFontSize(size); doc.setTextColor(...color); };
  const ensure = (h) => { if (y + h > 282) { doc.addPage(); y = 18; } };

  // Header band
  doc.setFillColor(...PINK); doc.rect(0, 0, W, 34, "F");
  font("bold", 22, [255, 255, 255]); text(CONFIG.storeName, M, 17);
  font("normal", 9, [255, 255, 255]);
  text([`WhatsApp ${CONFIG.whatsappDisplay}`, CONFIG.storeEmail, CONFIG.siteUrl.replace(/^https?:\/\//, "")].filter(Boolean).join("   |   "), M, 26);
  font("bold", 26, INK); text("INVOICE", W - M, 20, { align: "right" });
  y = 46;

  // Meta + bill to
  const meta = [["Invoice / Order", order.ref], ["Date", formatDate(order.createdAt)], ["Order status", order.orderStatus], ["Payment status", order.paymentStatus]];
  font("bold", 9, GREY); text("ORDER DETAILS", M, y); text("BILL & DELIVER TO", M + CW / 2 + 4, y);
  y += 6;
  let yl = y;
  meta.forEach(([k, v]) => { font("normal", 9, GREY); text(k, M, yl); font("bold", 10); text(v, M + 34, yl); yl += 6; });

  const c = order.customer;
  const addr = [c.address, c.apartment, `${c.city}${c.province ? ", " + c.province : ""}${c.postal ? " " + c.postal : ""}`, CONFIG.country].filter(Boolean).join(", ");
  let yr = y; const xr = M + CW / 2 + 4, wr = CW / 2 - 4;
  font("bold", 11); text(c.name, xr, yr); yr += 5.5;
  font("normal", 9.5);
  [c.email, formatPkPhone(c.phone)].forEach((l) => { text(l, xr, yr); yr += 5; });
  doc.splitTextToSize(addr, wr).forEach((l) => { text(l, xr, yr); yr += 5; });
  y = Math.max(yl, yr) + 6;

  // Items table
  const cols = { item: M + 3, qty: M + 112, unit: M + 142, total: W - M - 3 };
  const head = () => {
    doc.setFillColor(...INK); doc.roundedRect(M, y, CW, 9, 2, 2, "F");
    font("bold", 9, [255, 255, 255]);
    text("ITEM", cols.item, y + 6); text("QTY", cols.qty, y + 6, { align: "center" });
    text("UNIT PRICE", cols.unit, y + 6, { align: "center" }); text("TOTAL", cols.total, y + 6, { align: "right" });
    y += 13;
  };
  head();
  order.items.forEach((it, i) => {
    font("bold", 10); const nameLines = doc.splitTextToSize(it.name, 100);
    font("normal", 8.5); const varLines = it.variant ? doc.splitTextToSize(it.variant, 100) : [];
    const h = nameLines.length * 5 + varLines.length * 4 + 3;
    if (y + h > 282) { doc.addPage(); y = 18; head(); }
    if (i % 2 === 0) { doc.setFillColor(247, 247, 242); doc.rect(M, y - 4.5, CW, h + 1, "F"); }
    font("bold", 10); nameLines.forEach((l, k) => text(l, cols.item, y + k * 5));
    font("normal", 8.5, GREY); varLines.forEach((l, k) => text(l, cols.item, y + nameLines.length * 5 + k * 4 - 1));
    font("normal", 10); text(it.qty, cols.qty, y, { align: "center" }); text(pkr(it.unitPrice), cols.unit, y, { align: "center" });
    font("bold", 10); text(pkr(it.lineTotal), cols.total, y, { align: "right" });
    y += h + 2;
  });

  // Totals
  ensure(34);
  y += 2; doc.setDrawColor(...INK); doc.setLineWidth(0.4); doc.line(M + CW / 2, y, W - M, y); y += 7;
  const row = (k, v, bold) => { font(bold ? "bold" : "normal", bold ? 12 : 10); text(k, M + CW / 2 + 2, y); text(v, W - M - 3, y, { align: "right" }); y += bold ? 8 : 6; };
  row("Subtotal", pkr(order.subtotal));
  row("Delivery", order.shipping ? pkr(order.shipping) : "Free");
  if (order.discount) row("Discount", "-" + pkr(order.discount));
  row(`Total (${CONFIG.currency})`, pkr(order.total), true);

  if (c.notes) {
    ensure(16); font("bold", 9, GREY); text("ORDER NOTES", M, y); y += 5;
    font("normal", 9.5); doc.splitTextToSize(c.notes, CW).forEach((l) => { ensure(5); text(l, M, y); y += 5; });
    y += 3;
  }

  // WhatsApp instructions
  const steps = [
    `1. Send this invoice PDF to our official WhatsApp number ${CONFIG.whatsappDisplay}.`,
    `2. Mention your order reference ${order.ref} in the message.`,
    "3. Our team will review your order and confirm the next steps, including payment details.",
  ];
  const lines = steps.flatMap((s) => doc.splitTextToSize(s, CW - 12));
  const boxH = 14 + lines.length * 5;
  ensure(boxH + 22);
  doc.setFillColor(...LIME); doc.setDrawColor(...INK); doc.setLineWidth(0.6); doc.roundedRect(M, y, CW, boxH, 3, 3, "FD");
  font("bold", 11); text("Confirm your order on WhatsApp", M + 6, y + 8);
  font("normal", 9.5); lines.forEach((l, k) => text(l, M + 6, y + 14 + k * 5));
  y += boxH + 8;

  font("normal", 8, GREY);
  doc.splitTextToSize(
    `This invoice is not a payment receipt. Payment status: ${order.paymentStatus}. Your order is confirmed only after our team confirms it on WhatsApp. All prices are in ${CONFIG.currency}. Thank you for shopping with ${CONFIG.storeName}!`, CW
  ).forEach((l) => { text(l, M, y); y += 4; });

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) { doc.setPage(p); font("normal", 8, GREY); text(`${order.ref}  ·  Page ${p} of ${pages}`, W / 2, 291, { align: "center" }); }
  return doc;
}

export const invoiceFileName = (order) => `Invoice-${order.ref}.pdf`;

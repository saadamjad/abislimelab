import { initLayout } from "../layout.js?v=202610260106";
import { faqs } from "../../../data/products.js?v=202610260106";
import { $ } from "../utils.js?v=202610260106";
import { renderFaqs, faqJsonLd } from "./shared.js?v=202610260106";
import { refreshReveal } from "../layout.js?v=202610260106";

const page = location.pathname.split("/").pop() || "index.html";
initLayout(page);
const list = $("#faqList");
if (list) { renderFaqs(list, faqs); faqJsonLd(faqs); refreshReveal(); }

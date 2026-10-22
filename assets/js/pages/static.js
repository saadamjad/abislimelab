import { initLayout } from "../layout.js";
import { faqs } from "../../../data/products.js";
import { $ } from "../utils.js";
import { renderFaqs, faqJsonLd } from "./shared.js";
import { refreshReveal } from "../layout.js";

const page = location.pathname.split("/").pop() || "index.html";
initLayout(page);
const list = $("#faqList");
if (list) { renderFaqs(list, faqs); faqJsonLd(faqs); refreshReveal(); }

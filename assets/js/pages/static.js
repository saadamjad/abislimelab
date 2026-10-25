import { initLayout } from "../layout.js?v=202610251319";
import { faqs } from "../../../data/products.js?v=202610251319";
import { $ } from "../utils.js?v=202610251319";
import { renderFaqs, faqJsonLd } from "./shared.js?v=202610251319";
import { refreshReveal } from "../layout.js?v=202610251319";

const page = location.pathname.split("/").pop() || "index.html";
initLayout(page);
const list = $("#faqList");
if (list) { renderFaqs(list, faqs); faqJsonLd(faqs); refreshReveal(); }

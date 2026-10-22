import { initLayout, refreshReveal } from "../layout.js?v=202610230304";
import { categories, products, inCategory, productCard, getCategory, slimeArt } from "../catalog.js?v=202610230304";
import { faqs } from "../../../data/products.js?v=202610230304";
import { initHero } from "../hero3d.js?v=202610230304";
import { slimeSVG } from "../slime-svg.js?v=202610230304";
import { $, $$, esc } from "../utils.js?v=202610230304";
import { renderFaqs } from "./shared.js?v=202610230304";

initLayout("index.html");

$("#collectionGrid").innerHTML = categories.map((c, i) => {
  const n = inCategory(c.id).length;
  return `<a class="coll reveal" href="shop.html?cat=${esc(c.id)}" style="--bg:${esc(c.color)}">
    <span class="coll__emoji" aria-hidden="true">${esc(c.emoji)}</span>
    <span class="coll__name">${esc(c.name)}</span>
    <span class="coll__blurb">${esc(c.blurb)}</span>
    <span class="coll__count">${n} ${n === 1 ? "slime" : "slimes"} →</span>
  </a>`;
}).join("");

const best = products.filter((p) => p.bestSeller).slice(0, 4);
const fresh = [...products].filter((p) => p.isNew).sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 4);
$("#bestGrid").innerHTML = best.map(productCard).join("");
$("#newGrid").innerHTML = fresh.map(productCard).join("");
if (!fresh.length) $("#new").hidden = true;

// Texture showcase
const tex = categories.filter((c) => c.texture !== "kit");
const stage = $("#texStage");
function showTexture(id) {
  const c = getCategory(id);
  const sample = inCategory(id)[0];
  stage.style.setProperty("--bg", c.color);
  $("#texArt").innerHTML = slimeSVG(c.texture, sample?.c1 || "#FF8FC0", sample?.c2 || "#FFD1E8", c.id);
  stage.dataset.texture = c.texture;
  $("#texName").textContent = c.name;
  $("#texBlurb").textContent = c.blurb;
  $("#texLink").href = `shop.html?cat=${c.id}`;
  $("#texLink").textContent = `Shop ${c.name.toLowerCase()} →`;
  $$("#texTabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.id === id)));
}
$("#texTabs").innerHTML = tex.map((c) => `<button role="tab" type="button" data-id="${esc(c.id)}" aria-controls="texPanel">${esc(c.emoji)} ${esc(c.name.replace(" Slime", ""))}</button>`).join("");
$("#texTabs").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) showTexture(b.dataset.id); });
$("#texTabs").addEventListener("keydown", (e) => {
  if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
  const tabs = $$("#texTabs button"); const i = tabs.indexOf(document.activeElement);
  const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
  next.focus(); showTexture(next.dataset.id);
});
stage.addEventListener("pointerdown", () => { stage.classList.remove("squish"); void stage.offsetWidth; stage.classList.add("squish"); });
showTexture(tex[0].id);

// Story collage: four different textures from the catalog.
const seen = new Set();
$("#storyArt").innerHTML = products.filter((p) => !seen.has(p.category) && seen.add(p.category)).slice(0, 4)
  .map((p) => `<div class="story__tile">${slimeArt(p)}</div>`).join("");

renderFaqs($("#faqList"), faqs.slice(0, 4));
refreshReveal();
initHero($("#heroStage"));

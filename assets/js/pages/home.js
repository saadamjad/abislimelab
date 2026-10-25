import { initLayout, refreshReveal } from "../layout.js?v=202610260051";
import { categories, products, getCategory, productCard, slimeArt, productUrl } from "../catalog.js?v=202610260051";
import { initHero } from "../hero3d.js?v=202610260051";
import { waLink } from "../whatsapp.js?v=202610260051";
import { $, esc, pkr } from "../utils.js?v=202610260051";

initLayout("index.html");

// The Lab: every product, in catalog order.
$("#labGrid").innerHTML = products.map(productCard).join("");

// Order section: WhatsApp link built from config so the number lives in one place.
$("#orderWa").href = waLink("Hi Abi's Slime Lab! I'd like to order: ");

/* ---------- Slime Match: two questions, then a recommendation ---------- */
const MOODS = [
  ["pastels", "🩷", "Soft pastels"],
  ["neons", "💚", "Electric neons"],
  ["blues", "💙", "Cool blues"],
  ["magentas", "🟣", "Bold magentas"],
  ["icy", "🧊", "Icy tones"],
];
const FEELS = categories.map((c) => [c.id, c.emoji, c.feel || c.name]);
const QUESTIONS = [
  { key: "mood", title: "Pick your colour mood", options: MOODS },
  { key: "feel", title: "How should it feel?", options: FEELS },
];
const app = $("#matchApp");
let answers = {};

/** Texture match counts double; colour mood breaks ties. Sold-out slimes are skipped. */
function recommend({ mood, feel }) {
  const score = (p) => (p.category === feel ? 2 : 0) + ((p.moods || []).includes(mood) ? 1 : 0);
  const pool = products.filter((p) => p.stock !== "out");
  return [...pool].sort((a, b) => score(b) - score(a))[0];
}

function renderQuestion(i) {
  const q = QUESTIONS[i];
  app.innerHTML = `
    <p class="match__step">Question ${i + 1} of ${QUESTIONS.length}</p>
    <h3 class="match__q">${q.title}</h3>
    <div class="match__options">${q.options.map(([id, icon, label]) =>
      `<button type="button" class="match__opt" data-value="${esc(id)}"><span aria-hidden="true">${icon}</span>${esc(label)}</button>`).join("")}</div>
    ${i > 0 ? '<button type="button" class="link-btn match__back">← Back</button>' : ""}`;
  app.querySelectorAll(".match__opt").forEach((b) => b.addEventListener("click", () => {
    answers[q.key] = b.dataset.value;
    if (i + 1 < QUESTIONS.length) renderQuestion(i + 1); else renderResult();
  }));
  app.querySelector(".match__back")?.addEventListener("click", () => renderQuestion(i - 1));
}

function renderResult() {
  const p = recommend(answers);
  if (!p) { app.innerHTML = '<p>Everything is sold out right now. Message us on WhatsApp for the next restock.</p>'; return; }
  const cat = getCategory(p.category);
  app.innerHTML = `
    <div class="match__result">
      <div class="match__art">${slimeArt(p)}</div>
      <div class="match__info">
        <p class="pcard__cat">Your match · ${esc(cat?.name || "")}</p>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.description)}</p>
        ${p.scent ? `<p class="pcard__scent">Scent · ${esc(p.scent)}</p>` : ""}
        <p class="price">${pkr(p.price)}</p>
        <div class="match__actions">
          <button class="btn btn--pink" type="button" data-add="${esc(p.slug)}">Add to cart</button>
          <a class="btn" href="${productUrl(p)}">View spec sheet</a>
          <button class="link-btn match__again" type="button">Start over</button>
        </div>
      </div>
    </div>`;
  app.querySelector(".match__again").addEventListener("click", () => { answers = {}; renderQuestion(0); });
}
renderQuestion(0);

refreshReveal();
initHero($("#heroStage"));

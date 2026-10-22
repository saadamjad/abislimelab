import { initLayout, refreshReveal } from "../layout.js?v=202610230304";
import { categories, products, productCard, getCategory } from "../catalog.js?v=202610230304";
import { $, $$, esc } from "../utils.js?v=202610230304";

initLayout("shop.html");

const params = new URLSearchParams(location.search);
const state = {
  cat: getCategory(params.get("cat")) ? params.get("cat") : "all",
  flag: ["best", "new"].includes(params.get("flag")) ? params.get("flag") : "",
  q: params.get("q") || "",
  sort: params.get("sort") || "featured",
};

const chips = [["all", "All", "🫧"], ...categories.map((c) => [c.id, c.name.replace(" Slime", ""), c.emoji])];
$("#catChips").innerHTML = chips.map(([id, name, e]) => `<button type="button" class="chip" data-cat="${esc(id)}">${esc(e)} ${esc(name)}</button>`).join("");
$("#q").value = state.q;
$("#sort").value = state.sort;

function apply() {
  let list = products.slice();
  if (state.cat !== "all") list = list.filter((p) => p.category === state.cat);
  if (state.flag === "best") list = list.filter((p) => p.bestSeller);
  if (state.flag === "new") list = list.filter((p) => p.isNew);
  const q = state.q.trim().toLowerCase();
  if (q) list = list.filter((p) => (p.name + " " + p.description + " " + (getCategory(p.category)?.name || "")).toLowerCase().includes(q));
  const avail = (p) => (p.stock === "out" ? 1 : 0);
  const sorters = {
    featured: (a, b) => avail(a) - avail(b) || (b.bestSeller - a.bestSeller) || (b.isNew - a.isNew),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    newest: (a, b) => b.addedAt.localeCompare(a.addedAt),
  };
  list.sort(sorters[state.sort] || sorters.featured);

  $$(".chip[data-cat]").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === state.cat)));
  $$(".chip[data-flag]").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.flag === state.flag)));
  const cat = getCategory(state.cat);
  $("#shopTitle").textContent = state.flag === "best" ? "Best sellers" : state.flag === "new" ? "New drops" : cat ? cat.name : "Shop all slime";
  $("#shopBlurb").textContent = cat ? cat.blurb : "Every texture, every color. Tap a slime to see sizes and scents.";
  $("#resultCount").textContent = `${list.length} ${list.length === 1 ? "slime" : "slimes"}`;
  $("#grid").innerHTML = list.length ? list.map(productCard).join("") :
    `<div class="empty"><p class="empty__emoji" aria-hidden="true">🫠</p><h2>No slimes match that</h2><p>Try a different word or clear the filters.</p><button class="btn btn--pink" type="button" id="clearAll">Clear filters</button></div>`;
  refreshReveal();

  const u = new URLSearchParams();
  if (state.cat !== "all") u.set("cat", state.cat);
  if (state.flag) u.set("flag", state.flag);
  if (state.q) u.set("q", state.q);
  if (state.sort !== "featured") u.set("sort", state.sort);
  history.replaceState(null, "", "shop.html" + (u.toString() ? "?" + u : ""));
  document.title = `${$("#shopTitle").textContent} | Abi's Slime Lab`;
}

document.addEventListener("click", (e) => {
  const c = e.target.closest(".chip[data-cat]");
  if (c) { state.cat = c.dataset.cat; apply(); }
  const f = e.target.closest(".chip[data-flag]");
  if (f) { state.flag = state.flag === f.dataset.flag ? "" : f.dataset.flag; apply(); }
  if (e.target.closest("#clearAll")) { Object.assign(state, { cat: "all", flag: "", q: "" }); $("#q").value = ""; apply(); }
});
let tmr;
$("#q").addEventListener("input", (e) => { clearTimeout(tmr); tmr = setTimeout(() => { state.q = e.target.value; apply(); }, 150); });
$("#filterForm").addEventListener("submit", (e) => e.preventDefault());
$("#sort").addEventListener("change", (e) => { state.sort = e.target.value; apply(); });
apply();

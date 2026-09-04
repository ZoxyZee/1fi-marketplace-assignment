const brands = [
  ["Air India", "No-cost EMIs upto 18 months", "AIR INDIA", "#e4052e"],
  ["Apple Premium Reseller", "No-cost EMIs upto 24 months", "Apple", "#050505"],
  ["CaratLane", "No-cost EMIs upto 6 months", "CARAT", "#a9009a"],
  ["CGH Earth", "No-cost EMIs upto 24 months", "cgh", "#f8f8f8", true],
  ["Croma", "No-cost EMIs upto 12 months", "CROMA", "#16b5ad"],
];

const products = [
  ["iphone-16", "iPhone 16 Pro", 129900, "📱", ["128 GB", "256 GB", "Desert Titanium"], ["A18 Pro chip", "48 MP camera system", "6.3 inch Super Retina XDR display"], [[6, 21650, "Fastest payoff"], [12, 10825, "Popular"], [24, 5413, "Lowest monthly"]]],
  ["macbook-air", "MacBook Air M3", 114900, "💻", ["13 inch", "16 GB RAM", "512 GB SSD"], ["M3 performance", "All-day battery", "Lightweight aluminum body"], [[6, 19150, "Fastest payoff"], [12, 9575, "Popular"], [24, 4788, "Lowest monthly"]]],
  ["scooter", "Ather 450X", 147000, "🛵", ["Space Grey", "Pro Pack", "3.7 kWh"], ["Smart dashboard", "Fast charging support", "Backed by mutual fund limit"], [[12, 12250, "Balanced"], [18, 8167, "Popular"], [24, 6125, "Lowest monthly"]]],
  ["camera", "Sony Alpha ZV-E10", 69990, "📷", ["Body + Lens", "Black", "Creator Kit"], ["APS-C sensor", "4K video", "Flip-out display"], [[6, 11665, "Fastest payoff"], [9, 7777, "Popular"], [12, 5833, "Lowest monthly"]]],
].map(([id, name, price, image, variants, details, plans]) => ({ id, name, price, image, variants, details, plans }));

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = (value) => String(value).replace(/[&<>"']/g, (x) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[x]);
const formatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const rupee = (value) => formatter.format(value);
const state = { tab: "brands", search: "", products: [], product: null, variant: 0, plan: 0 };

const nodes = {
  tabs: $$(".tab"),
  search: $("#searchInput"),
  loading: $("#loadingState"),
  error: $("#errorState"),
  empty: $("#emptyState"),
  brands: $("#brandList"),
  products: $("#productList"),
  count: $("#productCount"),
  sheet: $("#detailsSheet"),
  content: $("#detailsContent"),
};

const matches = (item) => item.name.toLowerCase().includes(state.search);
const productCard = (e) => e.target.closest("[data-product]");

function renderBrands() {
  const list = brands.filter(([name]) => name.toLowerCase().includes(state.search));
  nodes.empty.classList.toggle("hidden", list.length || state.tab !== "brands");
  nodes.brands.innerHTML = list
    .map(([name, emi, logo, color, dark]) => `
      <article class="brand-card">
        <div class="brand-logo" style="background:${color};color:${dark ? "#2d3037" : "#fff"}">${esc(logo)}</div>
        <div><h3>${esc(name)}</h3><p>${esc(emi)}</p></div>
      </article>`)
    .join("");
}

function renderProducts() {
  const list = state.products.filter(matches);
  nodes.count.textContent = `${list.length} products`;
  nodes.empty.classList.toggle("hidden", list.length || state.tab !== "marketplace");
  nodes.products.innerHTML = list.map((product) => {
    const best = product.plans.at(-1);
    return `
      <article class="product-card" tabindex="0" role="button" data-product="${esc(product.id)}" aria-label="View ${esc(product.name)}">
        <div class="product-image">${esc(product.image)}</div>
        <div>
          <h3>${esc(product.name)}</h3><p>${rupee(product.price)}</p>
          <div class="product-meta">
            <span class="chip emi-chip">No-cost EMI from ${rupee(best[1])}/mo</span>
            <span class="chip">${esc(product.variants[0])}</span>
          </div>
        </div>
      </article>`;
  }).join("");
}

function renderDetails(done = false) {
  const product = state.product;
  if (!product) return;
  const selectedPlan = product.plans[state.plan];

  nodes.content.innerHTML = `
    <div class="detail-top">
      <div class="product-image">${esc(product.image)}</div>
      <div><h2>${esc(product.name)}</h2><div class="price">${rupee(product.price)}</div><p>No credit score required. Backed by your mutual fund portfolio.</p></div>
    </div>
    <div class="detail-block"><h4>Select variant</h4><div class="variant-row">
      ${product.variants.map((variant, i) => `<button class="variant ${i === state.variant ? "selected" : ""}" data-variant="${i}" type="button">${esc(variant)}</button>`).join("")}
    </div></div>
    <div class="detail-block"><h4>Choose EMI plan</h4><div class="plan-list">
      ${product.plans.map(([months, amount, label], i) => `
        <button class="plan ${i === state.plan ? "selected" : ""}" data-plan="${i}" type="button">
          <span><strong>${months} months</strong><span>${esc(label)}</span></span><strong>${rupee(amount)}/mo</strong>
        </button>`).join("")}
    </div></div>
    <div class="detail-block"><h4>Product details</h4><ul class="detail-list">${product.details.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <button class="cta" id="proceedButton" type="button">Proceed with ${selectedPlan[0]}-month EMI</button>
    ${done ? `<div class="confirmation">Plan selected. You can continue to checkout.</div>` : ""}`;
}

function render() {
  if (state.tab === "brands") renderBrands();
  if (state.tab === "marketplace") renderProducts();
}

function setTab(tab) {
  state.tab = tab;
  nodes.tabs.forEach((x) => x.classList.toggle("active", x.dataset.tab === tab));
  nodes.tabs.forEach((x) => x.setAttribute("aria-selected", x.dataset.tab === tab));
  ["brands", "stores", "marketplace"].forEach((name) => $(`#${name}Panel`).classList.toggle("hidden", name !== tab));
  nodes.search.placeholder = tab === "marketplace" ? "Search marketplace products..." : "Search online stores...";
  nodes.loading.classList.toggle("hidden", tab !== "marketplace" || state.products.length);
  nodes.empty.classList.add("hidden");
  nodes.sheet.classList.add("hidden");
  render();
}

function openProduct(id) {
  state.product = state.products.find((product) => product.id === id);
  if (!state.product) return;
  state.variant = 0;
  state.plan = 0;
  renderDetails();
  nodes.sheet.classList.remove("hidden");
}

nodes.tabs.forEach((tab) => tab.addEventListener("click", () => setTab(tab.dataset.tab)));
nodes.search.addEventListener("input", (e) => {
  state.search = e.target.value.trim().toLowerCase();
  render();
});

nodes.products.addEventListener("click", (e) => {
  const card = productCard(e);
  if (card) openProduct(card.dataset.product);
});
nodes.products.addEventListener("keydown", (e) => {
  const card = productCard(e);
  if (!["Enter", " "].includes(e.key) || !card) return;
  e.preventDefault();
  openProduct(card.dataset.product);
});
$("#closeSheet").addEventListener("click", () => nodes.sheet.classList.add("hidden"));

nodes.content.addEventListener("click", (e) => {
  const variant = e.target.closest("[data-variant]");
  const plan = e.target.closest("[data-plan]");
  if (variant) state.variant = Number(variant.dataset.variant);
  if (plan) state.plan = Number(plan.dataset.plan);
  if (variant || plan) renderDetails();
  if (e.target.id === "proceedButton") renderDetails(true);
});

renderBrands();
Promise.resolve(products)
  .then((data) => setTimeout(() => {
    state.products = data;
    nodes.loading.classList.add("hidden");
    renderProducts();
  }, 350))
  .catch(() => nodes.error.classList.remove("hidden"));

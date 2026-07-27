/**
 * Generates js/products-data.js from products.html card content.
 * Run: node scripts/build-products-data.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "products.html"), "utf8");

const itemRegex =
  /<div class="col-sm-6 col-lg-3 product-item" data-category="([^"]+)" data-brand="([^"]+)">([\s\S]*?)<\/div>\s*\n\s*<\/div>\s*\n\s*<\/div>/g;

const products = [];
let m;
while ((m = itemRegex.exec(html)) !== null) {
  const block = m[3];
  const category = m[1];
  const brand = m[2];
  const imgMatch = block.match(/src="([^"]+)"/);
  const titleMatch = block.match(/<h3 class="h5 mb-1">([\s\S]*?)<\/h3>/);
  const descMatch = block.match(
    /<p class="text-secondary small mb-3">([\s\S]*?)<\/p>/
  );
  const priceMatch = block.match(/<span class="price fw-semibold">([^<]+)<\/span>/);
  if (!imgMatch || !titleMatch) continue;

  const image = imgMatch[1];
  let id = path.basename(image, path.extname(image));
  const name = titleMatch[1].replace(/\s+/g, " ").trim();
  if (id === "adidas6" && /Dropset/.test(name)) id = "adidas-dropset";

  const summary = descMatch ? descMatch[1].replace(/\s+/g, " ").trim() : "";
  const priceDisplay = priceMatch ? priceMatch[1].trim() : "";
  const price = parseFloat(priceDisplay.replace(/[^\d.]/g, "")) || 0;

  products.push({ id, name, brand, category, price, priceDisplay, image, summary });
}

const BRAND_LABEL = { nike: "Nike", adidas: "Adidas", anta: "Anta", puma: "Puma" };
const CATEGORY_LABEL = {
  running: "Running",
  basketball: "Basketball",
  lifestyle: "Lifestyle",
  training: "Training",
};

const MIDSOLE = {
  running: ["Responsive foam", "NITRO / Zoom foam", "Lightweight EVA", "Dual-layer cushioning"],
  basketball: ["Full-length Zoom / React", "PROFOAM+ stack", "Heel-focused cushioning", "Court-ready foam"],
  lifestyle: ["Foam midsole for all-day wear", "Classic cupsole cushioning", "Lightweight EVA", "Soft platform midsole"],
  training: ["Stable heel clip + foam", "ReactX / NITRO training stack", "Firm lateral support", "Hybrid lift-and-run midsole"],
};

const OUTSOLE = {
  running: ["Rubber with road grip", "PUMAGRIP / road traction", "High-abrasion rubber", "Flex grooves for toe-off"],
  basketball: ["Herringbone court traction", "Multi-directional rubber", "Durable indoor/outdoor rubber", "Pivot-friendly outsole"],
  lifestyle: ["Rubber cupsole", "Classic flat rubber", "Durable street outsole", "Vulcanized-style grip"],
  training: ["Multi-surface gym rubber", "Rope-guard heel wrap", "Wide stable base", "Flex grooves + heel clip"],
};

function hashId(id) {
  return [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function specsFor(p) {
  const h = hashId(p.id);
  const brandName = BRAND_LABEL[p.brand] || p.brand;
  const cat = p.category;
  const weight = 240 + (h % 55);
  return [
    { label: "Brand", value: brandName },
    { label: "Category", value: CATEGORY_LABEL[cat] },
    { label: "Upper", value: `${brandName} ${cat === "lifestyle" ? "leather / textile blend" : "engineered mesh & overlays"}` },
    { label: "Midsole", value: MIDSOLE[cat][h % MIDSOLE[cat].length] },
    { label: "Outsole", value: OUTSOLE[cat][h % OUTSOLE[cat].length] },
    { label: "Weight (approx.)", value: `${weight}g (US 9)` },
    { label: "Available sizes", value: cat === "basketball" ? "US 7–13" : "US 6–12" },
  ];
}

function shippingFor(p) {
  const days = p.price >= 9000 ? "1–2" : "2–4";
  const returns = p.category === "lifestyle" ? 30 : 14;
  return (
    `${p.name} ships from KIXO Tanza within ${days} business days. ` +
    `Free standard delivery on orders over \u20B12,500. ` +
    `Unworn pairs with tags and original packaging qualify for returns or size exchanges within ${returns} days. ` +
    `${CATEGORY_LABEL[p.category]} footwear must be tried indoors on clean surfaces to remain return-eligible.`
  );
}

function descriptionFor(p) {
  const brandName = BRAND_LABEL[p.brand] || p.brand;
  return (
    `${p.summary} ` +
    `${p.name} from ${brandName} is stocked at KIXO for ${CATEGORY_LABEL[p.category].toLowerCase()} use—` +
    `pair it with your usual size unless you prefer a half size up for wide feet.`
  );
}

function formatPriceDisplay(price) {
  const hasDecimals = Math.round(price * 100) % 100 !== 0;
  return (
    "\u20B1" +
    price.toLocaleString("en-PH", {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    })
  );
}

const catalog = {};
products.forEach((p) => {
  catalog[p.id] = {
    id: p.id,
    name: p.name,
    brand: p.brand,
    brandLabel: BRAND_LABEL[p.brand] || p.brand,
    category: p.category,
    categoryLabel: CATEGORY_LABEL[p.category],
    price: p.price,
    priceDisplay: formatPriceDisplay(p.price),
    image: p.image,
    summary: p.summary,
    description: descriptionFor(p),
    specs: specsFor(p),
    shipping: shippingFor(p),
  };
});

const out = `/**
 * KIXO product catalog — one entry per shop card.
 * Used by product-details.html (?id=nike1, etc.).
 * Add or edit products here; keep id in sync with card links.
 */
window.KIXO_PRODUCTS = ${JSON.stringify(catalog, null, 2)};
`;

fs.writeFileSync(path.join(root, "js", "products-data.js"), out, "utf8");
console.log("Wrote js/products-data.js with", products.length, "products");

/* ============================================================
   PRODUCT CATALOG: add, edit or remove products and collections here,
   or use the product editor at /admin.html.
   - price is in PKR, whole rupees.
   - stockQty: jars on hand. 0 = sold out, 1–5 shows "Only N left". It also caps how many
     jars one order can include. Without stockQty, use stock: "in", "low" or "out".
   - variants (optional): each option can add a price delta in PKR, and a swatch colour
     (e.g. swatch: "#3CC5B5") to show it as a colour dot.
   - images: product photos, e.g. ["assets/img/cotton-cloud.webp"].
     Without images, a drawn slime in the colors c1/c2 is shown.
   - moods: colour moods used by the Slime Match quiz on the homepage.
   ============================================================ */
export const categories = [
  { id: "cloud",   name: "Cloud",   emoji: "☁️", color: "#FCE7F0", texture: "cloud",   feel: "Fluffy & airy",      blurb: "Airy, snow-textured slime that drapes like whipped cream." },
  { id: "butter",  name: "Butter",  emoji: "🧈", color: "#FFF3C4", texture: "butter",  feel: "Soft & spreadable",  blurb: "Dense, clay-based slime that spreads like frosting." },
  { id: "clear",   name: "Clear",   emoji: "💧", color: "#EAF1F7", texture: "clear",   feel: "Glassy & poppy",     blurb: "Cured, glassy slime made for bubble popping." },
  { id: "icee",    name: "Icee",    emoji: "🧊", color: "#E3F2FB", texture: "cloud",   feel: "Slushy & cool",      blurb: "Frozen slush texture that melts and reforms as you play." },
  { id: "crunchy", name: "Crunchy", emoji: "🥣", color: "#F1FFDC", texture: "crunchy", feel: "Crunchy & loud",     blurb: "Loaded with beads for the most satisfying crackle." },
];

export const products = [
  { slug: "cotton-cloud", name: "Cotton Cloud", category: "cloud", price: 750, scent: "Marshmallow & vanilla",
    c1: "#F9C6DA", c2: "#FCE7F0", emoji: "☁️", images: ["assets/img/cotton-cloud.webp"], moods: ["pastels", "magentas"],
    description: "Airy snow-textured slime that drapes like whipped cream and never sticks to your hands.",
    variants: [{ name: "Colour", options: [{ label: "Cotton Candy Pink", delta: 0, swatch: "#F7B6D2" }, { label: "Lavender", delta: 0, swatch: "#C9B6F2" }, { label: "Baby Blue", delta: 0, swatch: "#AFD8F5" }, { label: "Mint", delta: 0, swatch: "#B5EBD3" }] }],
    stockQty: 20,
    stock: "in", bestSeller: true, isNew: false, addedAt: "2026-09-01" },
  { slug: "buttercream-dream", name: "Buttercream Dream", category: "butter", price: 850, scent: "Fresh cut lime",
    c1: "#F6D98B", c2: "#FFF3C4", emoji: "🧈", images: ["assets/img/buttercream-dream.webp"], moods: ["pastels"],
    description: "Dense clay-based butter slime in warm buttercream yellow that spreads like frosting and folds back into a glossy block.",
    variants: [{ name: "Colour", options: [{ label: "Buttercream Yellow", delta: 0, swatch: "#F3D27A" }, { label: "Peach", delta: 0, swatch: "#F9BE9A" }, { label: "Pistachio", delta: 0, swatch: "#C8E3A6" }, { label: "Lilac", delta: 0, swatch: "#D7C4F0" }] }],
    stockQty: 20,
    stock: "in", bestSeller: true, isNew: false, addedAt: "2026-09-08" },
  { slug: "acid-disaster", name: "Acid Disaster", category: "clear", price: 900, scent: "Unscented",
    c1: "#8BE33B", c2: "#D9FF9E", emoji: "🧪", images: ["assets/img/acid-disaster.webp"], moods: ["neons"],
    description: "A four-week cured clear slime with a toxic neon green acid glow and hypnotic bubble popping.",
    variants: [{ name: "Colour", options: [{ label: "Neon Green", delta: 0, swatch: "#8BE33B" }, { label: "Electric Blue", delta: 0, swatch: "#3D9BFF" }, { label: "Hot Pink", delta: 0, swatch: "#FF4FA3" }, { label: "Crystal Clear", delta: 0, swatch: "#E8F4F8" }] }],
    stockQty: 20,
    stock: "in", bestSeller: false, isNew: true, addedAt: "2026-10-01" },
  { slug: "frost-icee", name: "Frost Icee", category: "icee", price: 880, scent: "Blue raspberry slush",
    c1: "#3D8BE0", c2: "#BFE3FA", emoji: "🧊", images: ["assets/img/frost-icee.webp"], moods: ["blues", "icy"],
    description: "A frozen slush texture with fine icee crystals that melts and reforms as you play, cool to the touch.",
    variants: [{ name: "Colour", options: [{ label: "Blue Raspberry", delta: 0, swatch: "#3D8BE0" }, { label: "Cherry", delta: 0, swatch: "#E5484D" }, { label: "Grape", delta: 0, swatch: "#8E5CD9" }, { label: "Lime", delta: 0, swatch: "#9BDB4D" }] }],
    stockQty: 20,
    stock: "in", bestSeller: false, isNew: true, addedAt: "2026-10-08" },
  { slug: "teal-tropic-crunch", name: "Teal Tropic Crunch", category: "crunchy", price: 950, scent: "Mango tangerine fizz",
    c1: "#3CC5B5", c2: "#C9F3EC", emoji: "🥭", images: ["assets/img/teal-tropic-crunch.webp"], moods: ["neons", "blues"],
    description: "A teal crunch loaded with pastel foam beads and glass sprinkles for the most satisfying crackle in Karachi.",
    variants: [{ name: "Colour", options: [{ label: "Tropic Teal", delta: 0, swatch: "#3CC5B5" }, { label: "Pink Lemonade", delta: 0, swatch: "#F78FB3" }, { label: "Mango", delta: 0, swatch: "#FFB547" }, { label: "Ube Purple", delta: 0, swatch: "#9D7BD8" }] }],
    stockQty: 20,
    stock: "in", bestSeller: true, isNew: true, addedAt: "2026-10-15" },
];

/* Frequently asked questions. {fee} and {whatsapp} are filled in from config.js. */
export const faqs = [
  { q: "How do I place an order?", a: "Add slimes to your cart, go to checkout and fill in your delivery details. No card is needed. After you place the order, download your invoice and send it to us on WhatsApp at {whatsapp}. We confirm within the hour during studio hours." },
  { q: "How do I pay?", a: "Cash on delivery across Karachi. For nationwide orders, we share payment details on WhatsApp when we confirm your order." },
  { q: "Is my order confirmed as soon as I place it?", a: "Not yet. Your order is saved as awaiting WhatsApp confirmation. Send your invoice to {whatsapp} and our team will confirm it." },
  { q: "How much is delivery?", a: "{fee}. Karachi orders get same-day delivery, and we ship nationwide via Leopards Courier." },
  { q: "What are your studio hours?", a: "Monday to Saturday, 12pm to 9pm PKT." },
  { q: "Do you take custom or party orders?", a: "Yes. For party favours and bulk jars, message us on WhatsApp at least 5 days ahead." },
  { q: "How do I keep my slime fresh?", a: "Seal the jar airtight, keep it at room temperature away from the sun, and play with clean, dry hands. See our slime care guide for more tips." },
];

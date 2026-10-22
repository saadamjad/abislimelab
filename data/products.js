/* ============================================================
   PRODUCT CATALOG: add, edit or remove products and collections here.
   - price is in PKR, whole rupees.
   - stock: "in" (in stock), "low" (only a few left) or "out" (sold out).
   - variants: each option can add a price delta in PKR.
   - images: optional list of image paths, e.g. ["assets/img/unicorn-1.webp"].
     Without images, a drawn slime in the colors c1/c2 is shown.
   - sample: true marks placeholder products. Remove it on real products.
   ============================================================ */
export const categories = [
  { id: "butter",  name: "Butter Slime",  emoji: "🧈", color: "#FFE14D", texture: "butter",  blurb: "Soft and spreadable. Glides around like frosting." },
  { id: "cloud",   name: "Cloud Slime",   emoji: "☁️", color: "#FFD1E8", texture: "cloud",   blurb: "Fluffy and drizzly. Pulls apart like cotton candy." },
  { id: "clear",   name: "Clear Slime",   emoji: "💧", color: "#CDEFFC", texture: "clear",   blurb: "Glassy, see-through and seriously stretchy." },
  { id: "jelly",   name: "Jelly Slime",   emoji: "🍮", color: "#FFC59E", texture: "jelly",   blurb: "Thick, wobbly and bouncy. Pokes back." },
  { id: "crunchy", name: "Crunchy Slime", emoji: "🥣", color: "#B8F34A", texture: "crunchy", blurb: "Loaded with beads for the loudest crunch." },
  { id: "glitter", name: "Glitter Slime", emoji: "✨", color: "#E4D9FF", texture: "glitter", blurb: "Shimmer in every stretch. Impossible to ignore." },
  { id: "kits",    name: "DIY Kits",      emoji: "🧪", color: "#FFFFFF", texture: "kit",     blurb: "Everything in one box to mix your own." },
];

const size = (large) => ({ name: "Size", options: [{ label: "Regular", delta: 0 }, { label: "Large", delta: large }] });

export const products = [
  { slug: "strawberry-milkshake", name: "Strawberry Milkshake", category: "butter", price: 950, c1: "#FF8FC0", c2: "#FFD1E8", emoji: "🍓",
    description: "A pink butter slime that spreads like soft-serve. Smooth, matte and super relaxing to squish.",
    variants: [size(450), { name: "Scent", options: [{ label: "Strawberry", delta: 0 }, { label: "Unscented", delta: 0 }] }],
    stock: "in", bestSeller: true, isNew: false, addedAt: "2026-08-02", sample: true },
  { slug: "mango-lassi", name: "Mango Lassi", category: "butter", price: 950, c1: "#FFC93C", c2: "#FFE9A3", emoji: "🥭",
    description: "Sunny yellow butter slime with a thick, creamy pull. Holds its shape when you poke it.",
    variants: [size(450)], stock: "in", bestSeller: false, isNew: true, addedAt: "2026-10-05", sample: true },
  { slug: "cotton-candy-cloud", name: "Cotton Candy Cloud", category: "cloud", price: 1150, c1: "#F9A8D4", c2: "#C4B5FD", emoji: "🍭",
    description: "Pastel cloud slime that drizzles and fluffs. Stretch it slowly and watch it snow.",
    variants: [size(500), { name: "Scent", options: [{ label: "Cotton candy", delta: 0 }, { label: "Vanilla", delta: 0 }] }],
    stock: "in", bestSeller: true, isNew: false, addedAt: "2026-07-18", sample: true },
  { slug: "blue-raspberry-snow", name: "Blue Raspberry Snow", category: "cloud", price: 1150, c1: "#7DD3FC", c2: "#E0F2FE", emoji: "❄️",
    description: "Icy blue cloud slime with a soft, powdery texture that melts back together.",
    variants: [size(500)], stock: "low", bestSeller: false, isNew: true, addedAt: "2026-10-12", sample: true },
  { slug: "ocean-glass", name: "Ocean Glass", category: "clear", price: 850, c1: "#38BDF8", c2: "#A5F3FC", emoji: "🌊",
    description: "Crystal clear slime with a hint of blue. Makes the best bubble pops.",
    variants: [size(400)], stock: "in", bestSeller: true, isNew: false, addedAt: "2026-06-30", sample: true },
  { slug: "lemon-fizz", name: "Lemon Fizz", category: "clear", price: 850, c1: "#FDE047", c2: "#FEF9C3", emoji: "🍋",
    description: "Glossy yellow clear slime with lemon slice charms floating inside.",
    variants: [size(400)], stock: "out", bestSeller: false, isNew: false, addedAt: "2026-05-14", sample: true },
  { slug: "gummy-bear-jelly", name: "Gummy Bear Jelly", category: "jelly", price: 1050, c1: "#FB7185", c2: "#FDBA74", emoji: "🐻",
    description: "Thick jelly slime that wobbles and bounces back when you squeeze it.",
    variants: [size(450)], stock: "in", bestSeller: false, isNew: true, addedAt: "2026-09-28", sample: true },
  { slug: "cereal-crunch", name: "Cereal Crunch", category: "crunchy", price: 1100, c1: "#FCD34D", c2: "#FB923C", emoji: "🥣",
    description: "Creamy base packed with colorful foam beads for the loudest crunch in the lab.",
    variants: [size(500)], stock: "in", bestSeller: true, isNew: false, addedAt: "2026-07-01", sample: true },
  { slug: "matcha-pop", name: "Matcha Pop", category: "crunchy", price: 1100, c1: "#A3E635", c2: "#D9F99D", emoji: "🍵",
    description: "Green crunchy slime with fishbowl beads. Clicky, poppy, very satisfying.",
    variants: [size(500)], stock: "in", bestSeller: false, isNew: false, addedAt: "2026-06-11", sample: true },
  { slug: "galaxy-glitter", name: "Galaxy Glitter", category: "glitter", price: 1250, c1: "#8B5CF6", c2: "#1E1B4B", emoji: "🌌",
    description: "Deep purple slime full of holographic glitter. Every stretch looks like outer space.",
    variants: [size(550)], stock: "in", bestSeller: true, isNew: false, addedAt: "2026-08-20", sample: true },
  { slug: "unicorn-shimmer", name: "Unicorn Shimmer", category: "glitter", price: 1250, c1: "#F0ABFC", c2: "#A5B4FC", emoji: "🦄",
    description: "Pastel rainbow slime with fine shimmer that catches the light.",
    variants: [size(550)], stock: "in", bestSeller: false, isNew: true, addedAt: "2026-10-18", sample: true },
  { slug: "starter-slime-kit", name: "Starter Slime Kit", category: "kits", price: 2500, c1: "#FF8DC0", c2: "#4CC9F0", emoji: "🧪",
    description: "A beginner box with bases, colors and add-ins to mix your own slimes at home.",
    variants: [{ name: "Kit", options: [{ label: "Starter", delta: 0 }, { label: "Party (bigger)", delta: 2000 }] }],
    stock: "in", bestSeller: false, isNew: false, addedAt: "2026-04-22", sample: true },
];

/* Frequently asked questions. {fee} and {whatsapp} are filled in from config.js. */
export const faqs = [
  { q: "How do I place an order?", a: "Add slimes to your cart, go to checkout and fill in your delivery details. No card is needed. After you place the order, you download your invoice and send it to us on WhatsApp." },
  { q: "Why don't you take online payment?", a: "We confirm every order personally on WhatsApp first. Payment details are shared with you there, after we confirm your order." },
  { q: "Is my order confirmed as soon as I place it?", a: "Not yet. Your order is saved as awaiting WhatsApp confirmation. Send your invoice to {whatsapp} and our team will confirm it and share the next steps." },
  { q: "How much is delivery?", a: "Delivery is {fee} per order. The exact amount is shown in your cart and at checkout before you place the order." },
  { q: "Where do you deliver?", a: "We deliver within Pakistan. Choose your city at checkout. If your city is not listed, pick Other and type it in." },
  { q: "Something arrived damaged. What now?", a: "Message us on WhatsApp with your order reference and a photo, and we'll help you sort it out." },
];

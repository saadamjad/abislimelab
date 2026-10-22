/* Hand-drawn style SVG illustrations: a distinct look for each slime texture.
   Colors come from each product (c1 = main, c2 = second). */
const INK = "#1B1035";
let n = 0;

const PUDDLE = "M38 132C28 98 56 64 100 62c46-2 72 34 62 70-6 22-32 30-62 30-32 0-56-8-62-30Z";
const CLOUD = "M56 146c-24 0-30-28-10-38-4-26 26-38 42-24 8-24 46-26 54 0 22-8 40 14 30 32 18 8 12 32-12 30Z";
const DOME = "M42 148c0-58 26-90 58-90s58 32 58 90c0 8-26 12-58 12s-58-4-58-12Z";

const shadow = (d) => `<path d="${d}" fill="${INK}" transform="translate(5 6)"/>`;
const shine = (x, y, w = 22, h = 11, o = 0.9) =>
  `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="#fff" opacity="${o}" transform="rotate(-24 ${x} ${y})"/><circle cx="${x + w + 6}" cy="${y + 8}" r="${h / 2.4}" fill="#fff" opacity="${o}"/>`;

function seeded(seed) { let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const builders = {
  butter: (id, c1, c2) => `
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    ${shadow(PUDDLE)}<path d="${PUDDLE}" fill="url(#${id})" stroke="${INK}" stroke-width="3"/>
    <path d="M72 112c8-16 46-18 56-2 6 10-8 20-24 16-12-3-14-12-4-15" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>
    <path d="M58 136c20 6 64 7 86-2" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" opacity=".25"/>
    ${shine(70, 84, 16, 7, 0.55)}`,

  cloud: (id, c1, c2, r) => {
    const dots = Array.from({ length: 16 }, () => `<circle cx="${60 + r() * 90}" cy="${84 + r() * 52}" r="${2 + r() * 3}" fill="#fff" opacity=".7"/>`).join("");
    return `
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    ${shadow(CLOUD)}<path d="${CLOUD}" fill="url(#${id})" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    ${dots}
    <path d="M84 150v14M104 150v22M122 150v10" stroke="${c1}" stroke-width="7" stroke-linecap="round"/>
    <path d="M84 150v14M104 150v22M122 150v10" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".35"/>
    ${shine(72, 96, 12, 6, 0.85)}`;
  },

  clear: (id, c1, c2, r) => {
    const bubbles = Array.from({ length: 9 }, () => { const x = 60 + r() * 80, y = 82 + r() * 56, s = 3 + r() * 8; return `<circle cx="${x}" cy="${y}" r="${s}" fill="none" stroke="#fff" stroke-width="2"/><circle cx="${x - s / 3}" cy="${y - s / 3}" r="${s / 4}" fill="#fff"/>`; }).join("");
    return `
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}" stop-opacity=".55"/><stop offset="1" stop-color="${c2}" stop-opacity=".7"/></linearGradient></defs>
    <path d="${PUDDLE}" fill="${INK}" opacity=".18" transform="translate(5 6)"/>
    <path d="${PUDDLE}" fill="url(#${id})" stroke="${INK}" stroke-width="3"/>
    ${bubbles}
    <path d="M56 98c10-20 34-30 52-30" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".95"/>`;
  },

  jelly: (id, c1, c2) => `
    <defs><radialGradient id="${id}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".25" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
    ${shadow(DOME)}<path d="${DOME}" fill="url(#${id})" stroke="${INK}" stroke-width="3"/>
    <path d="M62 128c-2-30 10-52 26-60" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".9"/>
    <circle cx="80" cy="140" r="4" fill="#fff" opacity=".9"/>
    <path d="M54 150c26 6 66 6 92 0" fill="none" stroke="${INK}" stroke-width="2.5" opacity=".25"/>`,

  crunchy: (id, c1, c2, r) => {
    const cols = ["#FF4FA3", "#4CC9F0", "#FFFFFF", "#FFE14D", "#B8F34A", "#8B5CF6"];
    const beads = Array.from({ length: 22 }, () => { const a = r() * Math.PI * 2, d = Math.sqrt(r()); const x = 100 + Math.cos(a) * d * 52, y = 112 + Math.sin(a) * d * 30; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(4 + r() * 3).toFixed(1)}" fill="${cols[Math.floor(r() * cols.length)]}" stroke="${INK}" stroke-width="1.6"/>`; }).join("");
    return `
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    ${shadow(PUDDLE)}<path d="${PUDDLE}" fill="url(#${id})" stroke="${INK}" stroke-width="3"/>${beads}`;
  },

  glitter: (id, c1, c2, r) => {
    const star = (x, y, s, c) => `<path d="M${x} ${y - s}L${x + s * 0.28} ${y - s * 0.28}L${x + s} ${y}L${x + s * 0.28} ${y + s * 0.28}L${x} ${y + s}L${x - s * 0.28} ${y + s * 0.28}L${x - s} ${y}L${x - s * 0.28} ${y - s * 0.28}Z" fill="${c}"/>`;
    const specks = Array.from({ length: 40 }, () => `<circle cx="${(52 + r() * 96).toFixed(1)}" cy="${(80 + r() * 64).toFixed(1)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="${r() > 0.5 ? "#fff" : "#FFE14D"}"/>`).join("");
    return `
    <defs><radialGradient id="${id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
    ${shadow(PUDDLE)}<path d="${PUDDLE}" fill="url(#${id})" stroke="${INK}" stroke-width="3"/>${specks}
    ${star(82, 100, 10, "#fff")}${star(128, 118, 7, "#FFE14D")}${star(108, 92, 5, "#fff")}${star(150, 54, 9, "#FFE14D")}${star(40, 70, 6, "#fff")}`;
  },

  kit: (id, c1, c2) => `
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <rect x="57" y="62" width="96" height="108" rx="18" fill="${INK}"/>
    <rect x="52" y="56" width="96" height="108" rx="18" fill="#fff" fill-opacity=".6" stroke="${INK}" stroke-width="3"/>
    <path d="M55 112c14-10 30 6 46-2s30-10 44 0v34c0 8-6 14-14 14H69c-8 0-14-6-14-14Z" fill="url(#${id})"/>
    <rect x="46" y="40" width="108" height="24" rx="8" fill="${c1}" stroke="${INK}" stroke-width="3"/>
    <rect x="70" y="80" width="60" height="24" rx="6" fill="#fff" stroke="${INK}" stroke-width="2"/>
    <path d="M80 92h40" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <path d="M62 74v60" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`,
};

/** Returns an <svg> string for a slime texture. */
export function slimeSVG(texture, c1, c2, seed = "x") {
  const build = builders[texture] || builders.butter;
  const id = `sg${++n}`;
  return `<svg class="slime-svg slime-svg--${texture}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">${build(id, c1, c2, seeded(seed + texture))}</svg>`;
}

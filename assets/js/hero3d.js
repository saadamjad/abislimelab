/* Interactive slime for the homepage hero.
   Each texture changes the shape, surface and extras, not just the color.
   Three.js loads only on the homepage. Without WebGL, or with reduced motion,
   a drawn slime is shown instead and still squishes on tap. */
import { $, $$, reducedMotion } from "./utils.js";
import { slimeSVG } from "./slime-svg.js";

export const MODES = {
  butter:  { hex: "#FFD84D", c2: "#FFB547", label: "Butter",  desc: "Smooth and matte. Spreads like frosting.",       roughness: 0.55, clearcoat: 0.2, transmission: 0,   sheen: 0, iridescence: 0, wobble: 0.05, bump: 0,     scale: [1.12, 0.84, 1.12] },
  cloud:   { hex: "#FF9FD0", c2: "#C4B5FD", label: "Cloud",   desc: "Fluffy and bumpy. Drizzles when you stretch it.", roughness: 0.95, clearcoat: 0,   transmission: 0,   sheen: 1, iridescence: 0, wobble: 0.04, bump: 0.06,  scale: [1, 0.95, 1] },
  clear:   { hex: "#58D3FF", c2: "#A5F3FC", label: "Clear",   desc: "Glassy and see-through. Great for bubbles.",      roughness: 0.03, clearcoat: 1,   transmission: 0.9, sheen: 0, iridescence: 0.2, wobble: 0.04, bump: 0,   scale: [1.05, 0.9, 1.05] },
  jelly:   { hex: "#FB7185", c2: "#FDBA74", label: "Jelly",   desc: "Thick and bouncy. Wobbles back when poked.",      roughness: 0.12, clearcoat: 1,   transmission: 0.3, sheen: 0, iridescence: 0, wobble: 0.1,  bump: 0,     scale: [0.95, 1.08, 0.95] },
  crunchy: { hex: "#A3E635", c2: "#D9F99D", label: "Crunchy", desc: "Packed with beads for a loud crunch.",            roughness: 0.5,  clearcoat: 0.3, transmission: 0,   sheen: 0, iridescence: 0, wobble: 0.04, bump: 0,     scale: [1.08, 0.88, 1.08], beads: true },
  glitter: { hex: "#8B5CF6", c2: "#F0ABFC", label: "Glitter", desc: "Deep color with sparkles in every stretch.",      roughness: 0.15, clearcoat: 1,   transmission: 0,   sheen: 0, iridescence: 1, wobble: 0.06, bump: 0,     scale: [1.05, 0.92, 1.05], sparkle: true },
};

export async function initHero(stage) {
  const wrap = stage.parentElement;
  const fallback = stage.querySelector(".hero-fallback");
  let api = null, current = "butter";

  const setMode = (key) => {
    const m = MODES[key]; if (!m) return;
    current = key;
    $$(".hero-chip", wrap).forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.mode === key)));
    stage.dataset.slime = key;
    $("#heroSlimeNote", wrap).innerHTML = `<strong>${m.label} slime</strong>${m.desc}`;
    fallback.innerHTML = slimeSVG(key === "crunchy" ? "crunchy" : key, m.hex, m.c2, "hero");
    api?.setMode(m);
  };
  $$(".hero-chip", wrap).forEach((c) => c.addEventListener("click", () => setMode(c.dataset.mode)));

  const poked = () => stage.classList.add("poked");
  fallback.addEventListener("pointerdown", () => { poked(); fallback.classList.remove("squish"); void fallback.offsetWidth; fallback.classList.add("squish"); });
  setMode("butter");

  if (reducedMotion()) return;
  const probe = document.createElement("canvas");
  if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;

  try {
    const THREE = await import("three");
    const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
    api = build(THREE, RoomEnvironment, stage, poked);
    stage.classList.add("is-3d");
    api.setMode(MODES[current]);
  } catch (err) {
    console.warn("3D hero unavailable, using drawn slime.", err);
  }
}

function build(THREE, RoomEnvironment, stage, onPoke) {
  const small = matchMedia("(max-width: 760px)").matches;
  const canvas = document.createElement("canvas");
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  stage.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0.2, 7.4);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xffd1e8, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 4, 5); scene.add(key);

  const R = 1.2, seg = small ? 72 : 112;
  const geo = new THREE.SphereGeometry(R, seg, seg);
  const base = geo.attributes.position.array.slice();
  const pos = geo.attributes.position.array;
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xffd84d, clearcoatRoughness: 0.08, thickness: 1.6, ior: 1.35, sheenColor: new THREE.Color(0xffffff), sheenRoughness: 0.4 });
  const blob = new THREE.Mesh(geo, mat);
  const group = new THREE.Group();
  group.add(blob); scene.add(group);

  // Shadow puddle under the slime
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.25, 48), new THREE.MeshBasicMaterial({ color: 0x1b1035, transparent: true, opacity: 0.12 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.25; shadow.scale.set(1.2, 1, 0.5);
  scene.add(shadow);

  // Crunchy beads and glitter sparkles ride on the surface.
  const dirs = (count) => Array.from({ length: count }, () => new THREE.Vector3().randomDirection());
  const beadDirs = dirs(small ? 46 : 70);
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 14, 14), new THREE.MeshPhysicalMaterial({ roughness: 0.25, clearcoat: 1 }), beadDirs.length);
  const beadCols = [0xff4fa3, 0x4cc9f0, 0xffffff, 0xffe14d, 0x8b5cf6].map((c) => new THREE.Color(c));
  beadDirs.forEach((_, i) => beads.setColorAt(i, beadCols[i % beadCols.length]));
  blob.add(beads);
  const sparkDirs = dirs(small ? 90 : 140);
  const sparkGeo = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(sparkDirs.flatMap((d) => [d.x * R * 1.03, d.y * R * 1.03, d.z * R * 1.03]), 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: 0xfff6c2, size: 0.05, transparent: true }));
  blob.add(sparks);

  let m = null;
  let targetColor = new THREE.Color(0xffd84d);
  const baseScale = new THREE.Vector3(1, 1, 1), targetScale = new THREE.Vector3(1, 1, 1);
  let wobble = 0.05, bump = 0, tBump = 0, tWobble = 0.05;
  const poke = { dir: new THREE.Vector3(0, 0, 1), amp: 0, age: 0 };
  const spring = { s: 0, v: 0 };
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let spin = 0.003, dragging = false, lastX = 0, lastY = 0, dragDist = 0;

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(blob, false)[0];
    if (hit) { poke.dir.copy(blob.worldToLocal(hit.point.clone())).normalize(); poke.amp = 0.3; poke.age = 0; }
    spring.v += 5;
    dragging = true; dragDist = 0; lastX = e.clientX; lastY = e.clientY;
    onPoke();
  });
  addEventListener("pointerup", () => { dragging = false; });
  addEventListener("pointermove", (e) => {
    if (dragging) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY; dragDist += Math.abs(dx);
      spin += dx * 0.0009;
      tilt.tx = Math.max(-0.5, Math.min(0.5, tilt.tx + dy * 0.004));
      lastX = e.clientX; lastY = e.clientY;
    } else if (e.pointerType === "mouse") {
      tilt.tx = (e.clientY / innerHeight - 0.5) * 0.4;
      tilt.ty = (e.clientX / innerWidth - 0.5) * 0.6;
    }
  }, { passive: true });

  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(stage); resize();

  let visible = true, last = performance.now(), t = 0;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { last = performance.now(); requestAnimationFrame(loop); } }).observe(stage);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { last = performance.now(); requestAnimationFrame(loop); } });

  const dummy = new THREE.Object3D();
  function deform() {
    const { x: px, y: py, z: pz } = poke.dir;
    for (let i = 0; i < pos.length; i += 3) {
      const nx = base[i] / R, ny = base[i + 1] / R, nz = base[i + 2] / R;
      let d = wobble * (Math.sin(nx * 3 + t * 1.1) * Math.sin(ny * 2.6 + t * 0.9) * Math.sin(nz * 3.2 + t * 1.3) * 1.6 + 0.45 * Math.sin(nx * 5.3 - t * 1.7 + ny * 4.1));
      if (bump > 0.001) d += bump * Math.abs(Math.sin(nx * 9 + 1.3) * Math.sin(ny * 8 + 0.4) * Math.sin(nz * 9 + 2.1)) * 2.2;
      if (poke.amp > 0.002) {
        const dist = Math.acos(Math.max(-1, Math.min(1, nx * px + ny * py + nz * pz)));
        d += -poke.amp * Math.exp(-dist * dist * 5) + poke.amp * 0.3 * Math.sin(dist * 10 - poke.age * 16) * Math.exp(-dist * 1.4);
      }
      const r = R * (1 + d);
      pos[i] = nx * r; pos[i + 1] = ny * r; pos[i + 2] = nz * r;
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  }

  function loop(now = performance.now()) {
    if (!visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;

    spring.v += (-60 * spring.s - 7 * spring.v) * dt; spring.s += spring.v * dt;
    const s = Math.max(-0.35, Math.min(0.35, spring.s * 0.2));
    baseScale.lerp(targetScale, dt * 5);
    blob.scale.set(baseScale.x * (1 + s * 0.6), baseScale.y * (1 - s), baseScale.z * (1 + s * 0.6));
    shadow.scale.set(1.2 * baseScale.x * (1 + s * 0.4), 1, 0.5);
    poke.amp *= Math.pow(0.12, dt); poke.age += dt;
    bump += (tBump - bump) * dt * 4; wobble += (tWobble - wobble) * dt * 4;

    spin += (0.003 - spin) * dt * 1.5;
    blob.rotation.y += spin;
    tilt.x += (tilt.tx - tilt.x) * dt * 4; tilt.y += (tilt.ty - tilt.y) * dt * 4;
    group.rotation.set(tilt.x, tilt.y, 0);
    group.position.y = Math.sin(t * 1.2) * 0.06;
    mat.color.lerp(targetColor, dt * 5);
    if (sparks.visible) sparks.material.opacity = 0.6 + Math.sin(t * 6) * 0.4;

    deform();
    if (beads.visible) {
      beadDirs.forEach((d, i) => { dummy.position.copy(d).multiplyScalar(R * (1 + wobble * 0.5)); dummy.updateMatrix(); beads.setMatrixAt(i, dummy.matrix); });
      beads.instanceMatrix.needsUpdate = true;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return {
    setMode(mode) {
      m = mode;
      targetColor = new THREE.Color(m.hex);
      Object.assign(mat, { roughness: m.roughness, clearcoat: m.clearcoat, transmission: m.transmission, sheen: m.sheen, iridescence: m.iridescence });
      mat.needsUpdate = true;
      tWobble = m.wobble; tBump = m.bump;
      targetScale.set(...m.scale);
      beads.visible = !!m.beads; sparks.visible = !!m.sparkle;
      spring.v += 4; // a little bounce so the change is noticeable
    },
  };
}

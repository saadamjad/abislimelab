/* Interactive glossy slime for the homepage hero.
   Three.js loads only on the homepage. Without WebGL, or with reduced motion,
   the CSS blob fallback stays visible and still squishes on tap. */
import { $$, reducedMotion } from "./utils.js";

export const MODES = {
  butter:  { hex: "#FFD84D", c2: "#FFB547", roughness: 0.38, clearcoat: 0.5, transmission: 0,    sheen: 0,   iridescence: 0,   wobble: 0.07, label: "Butter" },
  cloud:   { hex: "#FF8FC8", c2: "#C4B5FD", roughness: 0.9,  clearcoat: 0,   transmission: 0,    sheen: 1,   iridescence: 0,   wobble: 0.13, label: "Cloud" },
  clear:   { hex: "#58D3FF", c2: "#A5F3FC", roughness: 0.04, clearcoat: 1,   transmission: 0.82, sheen: 0,   iridescence: 0.3, wobble: 0.05, label: "Clear" },
  glitter: { hex: "#9B6BFF", c2: "#F0ABFC", roughness: 0.16, clearcoat: 1,   transmission: 0,    sheen: 0,   iridescence: 1,   wobble: 0.08, label: "Glitter" },
};

export async function initHero(stage) {
  const fallback = stage.querySelector(".hero-blob");
  let api = null;

  const setMode = (key) => {
    const m = MODES[key]; if (!m) return;
    stage.style.setProperty("--blob-c1", m.hex);
    stage.style.setProperty("--blob-c2", m.c2);
    $$(".hero-chip", stage.parentElement).forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.mode === key)));
    api?.setMode(m);
  };
  $$(".hero-chip", stage.parentElement).forEach((c) => c.addEventListener("click", () => setMode(c.dataset.mode)));

  // Fallback squish works everywhere.
  fallback.addEventListener("pointerdown", () => {
    fallback.classList.remove("squish"); void fallback.offsetWidth; fallback.classList.add("squish");
  });

  if (reducedMotion()) return;
  const probe = document.createElement("canvas");
  if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;

  try {
    const THREE = await import("three");
    const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
    api = build(THREE, RoomEnvironment, stage);
    stage.classList.add("is-3d");
    setMode("butter");
  } catch (err) {
    console.warn("3D hero unavailable, using fallback.", err);
  }
}

function build(THREE, RoomEnvironment, stage) {
  const small = matchMedia("(max-width: 760px)").matches;
  const canvas = document.createElement("canvas");
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  stage.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 7);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xffd1e8, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 4, 5); scene.add(key);

  const R = 1.45, seg = small ? 72 : 120;
  const geo = new THREE.SphereGeometry(R, seg, seg);
  const base = geo.attributes.position.array.slice();
  const pos = geo.attributes.position.array;
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xffd84d, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.08, thickness: 1.6, ior: 1.35, sheenColor: new THREE.Color(0xffffff), sheenRoughness: 0.5 });
  const blob = new THREE.Mesh(geo, mat);
  const group = new THREE.Group();
  group.add(blob); scene.add(group);

  // Floating bubbles
  const bubMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0, clearcoat: 1, transparent: true, opacity: 0.45, iridescence: 1 });
  const bubbles = Array.from({ length: small ? 5 : 8 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.09 + Math.random() * 0.14, 24, 24), bubMat);
    const a = (i / 8) * Math.PI * 2;
    m.userData = { a, r: 2.1 + Math.random() * 0.5, y: (Math.random() - 0.5) * 2.4, s: 0.3 + Math.random() * 0.4 };
    scene.add(m); return m;
  });

  let wobble = 0.07, targetColor = new THREE.Color(0xffd84d);
  const poke = { dir: new THREE.Vector3(0, 0, 1), amp: 0, age: 0 };
  const spring = { s: 0, v: 0 };
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let spin = 0.004, dragging = false, lastX = 0, lastY = 0;

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const toNdc = (e) => { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };

  canvas.addEventListener("pointerdown", (e) => {
    toNdc(e); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(blob)[0];
    if (hit) { poke.dir.copy(blob.worldToLocal(hit.point.clone())).normalize(); poke.amp = 0.32; poke.age = 0; }
    spring.v += 5.5;
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    stage.classList.add("poked");
  });
  addEventListener("pointerup", () => { dragging = false; });
  addEventListener("pointermove", (e) => {
    if (dragging) {
      spin += (e.clientX - lastX) * 0.0009;
      tilt.tx = Math.max(-0.6, Math.min(0.6, tilt.tx + (e.clientY - lastY) * 0.004));
      lastX = e.clientX; lastY = e.clientY;
    } else if (e.pointerType === "mouse") {
      tilt.tx = (e.clientY / innerHeight - 0.5) * 0.5;
      tilt.ty = (e.clientX / innerWidth - 0.5) * 0.7;
    }
  }, { passive: true });

  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(stage); resize();

  let visible = true, last = performance.now(), t = 0;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) requestAnimationFrame(loop); }).observe(stage);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { last = performance.now(); requestAnimationFrame(loop); } });

  function deform() {
    const { x: px, y: py, z: pz } = poke.dir;
    for (let i = 0; i < pos.length; i += 3) {
      const nx = base[i] / R, ny = base[i + 1] / R, nz = base[i + 2] / R;
      let d = wobble * (Math.sin(nx * 3 + t * 1.1) * Math.sin(ny * 2.6 + t * 0.9) * Math.sin(nz * 3.2 + t * 1.3) * 1.6
        + 0.45 * Math.sin(nx * 5.3 - t * 1.7 + ny * 4.1));
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
    blob.scale.set(1 + s * 0.6, 1 - s, 1 + s * 0.6);
    poke.amp *= Math.pow(0.12, dt); poke.age += dt;

    spin += (0.004 - spin) * dt * 1.5;
    blob.rotation.y += spin;
    tilt.x += (tilt.tx - tilt.x) * dt * 4; tilt.y += (tilt.ty - tilt.y) * dt * 4;
    group.rotation.set(tilt.x, tilt.y, 0);
    group.position.y = Math.sin(t * 1.2) * 0.08;

    mat.color.lerp(targetColor, dt * 4);
    bubbles.forEach((b) => {
      const u = b.userData;
      b.position.set(Math.cos(u.a + t * u.s) * u.r, u.y + Math.sin(t * u.s * 2 + u.a) * 0.3, Math.sin(u.a + t * u.s) * u.r * 0.6);
    });

    deform();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return {
    setMode(m) {
      targetColor = new THREE.Color(m.hex);
      Object.assign(mat, { roughness: m.roughness, clearcoat: m.clearcoat, transmission: m.transmission, sheen: m.sheen, iridescence: m.iridescence });
      mat.needsUpdate = true;
      wobble = m.wobble;
      spring.v += 3;
    },
  };
}

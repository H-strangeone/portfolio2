import * as THREE from "three";
import gsap from "gsap";
import rustImg    from "../public/rust.jpg";
import golangImg  from "../public/golang.jpg";
import pythonImg  from "../public/python.jpg";
import cudaImg    from "../public/cuda.jpg";

// ─── PROJECT DATA ─────────────────────────────────────────
const PROJECTS = [
  { image: rustImg,   title: "Project One",   sub: "Rust · Systems programming at its finest",   link: "https://github.com/H-strangeone/project-one" },
  { image: rustImg,   title: "Project Two",   sub: "Rust · A fast CLI utility",                  link: "https://github.com/H-strangeone/project-two" },
  { image: golangImg, title: "Project Three", sub: "Go · Scalable backend service",              link: "https://github.com/H-strangeone/project-three" },
  { image: golangImg, title: "Project Four",  sub: "Go · REST API with auth",                   link: "https://github.com/H-strangeone/project-four" },
  { image: pythonImg, title: "Project Five",  sub: "Python · Machine learning pipeline",        link: "https://github.com/H-strangeone/project-five" },
  { image: cudaImg,   title: "Project Six",   sub: "CUDA · GPU-accelerated compute",            link: "https://github.com/H-strangeone/project-six" },
];

const COUNT       = PROJECTS.length;
const RADIUS      = 5;
const STEP        = (Math.PI * 2) / COUNT;
const CARD_W      = 3.6;
const CARD_H      = 2.2;
const FACE_THRESH = 0.80;

// ─── STATE ────────────────────────────────────────────────
let scene, camera, renderer, rootNode;
let currentIndex = 0;
let isRotating   = false;
let hoveredCard  = null;
let isActive     = false;

const textureLoader = new THREE.TextureLoader();
const raycaster     = new THREE.Raycaster();
const mouse         = new THREE.Vector2(-9999, -9999);

// HTML overlay elements for title / sub (created once, updated on rotation)
let domTitle, domSub;

// Per-card smooth state
const cardState = PROJECTS.map(() => ({
  scaleCurrent: 1,
  scaleTarget:  1,
}));

// Reusable vectors
const _worldQuat = new THREE.Quaternion();
const _worldPos  = new THREE.Vector3();
const _cardFwd   = new THREE.Vector3();
const _toCam     = new THREE.Vector3();
const _col       = new THREE.Color();

// ─── INIT ─────────────────────────────────────────────────
export function initThree() {
  const container = document.getElementById("three-container");
  if (!container) return;

  // ── DOM OVERLAY ──────────────────────────────────────────
  // Title sits above the canvas, sub sits below — pure HTML, no texture
  buildDomOverlay(container);

  // ── SCENE ────────────────────────────────────────────────
  scene = new THREE.Scene();
  // No THREE.Fog — we handle edge darkening via CSS vignette

  // ── CAMERA ───────────────────────────────────────────────
  camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1, 100
  );
  camera.position.set(0, 0.5, 0);

  // ── RENDERER ─────────────────────────────────────────────
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Insert canvas BEFORE the overlay divs so overlay sits on top
  container.insertBefore(renderer.domElement, container.firstChild);

  // ── LIGHTS ───────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.40));

  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(2, 8, 3);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xd0d8e8, 0.25);
  fill.position.set(-5, 2, 1);
  scene.add(fill);

  // Spotlight locked on the front-card position — cinema look
  const spot = new THREE.SpotLight(0xffffff, 3.5, 24, Math.PI / 5.5, 0.55, 2.0);
  spot.position.set(0, 6, -1);
  spot.target.position.set(0, 0, -RADIUS);
  scene.add(spot);
  scene.add(spot.target);

  // ── FLOOR REFLECTION ─────────────────────────────────────
  // buildFloor();

  // ── CAROUSEL ─────────────────────────────────────────────
  rootNode = new THREE.Object3D();
  scene.add(rootNode);

  const cardGeo   = new THREE.PlaneGeometry(CARD_W, CARD_H);
  const borderGeo = new THREE.PlaneGeometry(CARD_W + 0.10, CARD_H + 0.10);

  PROJECTS.forEach((proj, i) => {
    const base = new THREE.Object3D();
    base.rotation.y = i * STEP;
    rootNode.add(base);

    const group = new THREE.Group();
    group.position.z = -RADIUS;
    group.userData   = { index: i, link: proj.link };
    base.add(group);

    // Border
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0x222222, transparent: true, opacity: 0.45,
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.z = -0.015;
    group.add(borderMesh);
    group.userData.borderMesh = borderMesh;

    // Image
    const tex = textureLoader.load(proj.image);
    tex.colorSpace = THREE.SRGBColorSpace;
    const imageMat = new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.45, metalness: 0.04,
      transparent: true, opacity: 1,
    });
    const imageMesh = new THREE.Mesh(cardGeo, imageMat);
    imageMesh.userData.parentGroup = group;
    imageMesh.userData.isImage     = true;
    group.add(imageMesh);
    group.userData.imageMesh = imageMesh;

    // Reflection card (flipped below the floor)
    buildReflectionCard(base, group, tex);
  });

  // ── VIGNETTE OVERLAY ─────────────────────────────────────
  buildVignette(container);

  // ── ARROWS ───────────────────────────────────────────────
  const leftArrow  = document.getElementById("arrow-left");
  const rightArrow = document.getElementById("arrow-right");
  if (leftArrow)  leftArrow.addEventListener("click",  () => rotateToIndex(currentIndex - 1));
  if (rightArrow) rightArrow.addEventListener("click", () => rotateToIndex(currentIndex + 1));

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  rotateToIndex(currentIndex - 1);
    if (e.key === "ArrowRight") rotateToIndex(currentIndex + 1);
  });

  // ── MOUSE ────────────────────────────────────────────────
  container.addEventListener("mousemove", (e) => {
    const r = container.getBoundingClientRect();
    mouse.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
    mouse.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
  });
  container.addEventListener("mouseleave", () => mouse.set(-9999, -9999));

  // Click — only front card opens link
  container.addEventListener("click", () => {
    if (!hoveredCard) return;
    if (hoveredCard.userData.index !== currentIndex) return;
    window.open(hoveredCard.userData.link, "_blank");
  });

  // Touch
  container.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    const r = container.getBoundingClientRect();
    const tm = new THREE.Vector2(
      ((t.clientX - r.left) / r.width)  * 2 - 1,
     -((t.clientY - r.top)  / r.height) * 2 + 1
    );
    raycaster.setFromCamera(tm, camera);
    const planes = [];
    rootNode.children.forEach(b => { if (b.children[0]?.userData.imageMesh) planes.push(b.children[0].userData.imageMesh); });
    const hits = raycaster.intersectObjects(planes, false);
    if (!hits.length) return;
    const group = hits[0].object.userData.parentGroup;
    if (!group) return;
    group.userData.index === currentIndex
      ? window.open(group.userData.link, "_blank")
      : rotateToIndex(group.userData.index);
  });

  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Show initial title
  updateDomText(currentIndex, false);

  renderer.setAnimationLoop(animate);
}

// ─── FLOOR + REFLECTION SETUP ─────────────────────────────
function buildFloor() {
  // Dark, barely-reflective floor plane
  const floorGeo = new THREE.PlaneGeometry(80, 80);
  const floorMat = new THREE.MeshStandardMaterial({
    color:     0x050505,
    roughness: 0.88,
    metalness: 0.12,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -CARD_H / 2 - 0.05; // sits just under the cards
  scene.add(floor);
}

function buildReflectionCard(base, group, tex) {
  // A flipped, blurred-looking, very faint copy below the floor
  const reflGeo = new THREE.PlaneGeometry(CARD_W, CARD_H);
  const reflMat = new THREE.MeshBasicMaterial({
    map:         tex,
    transparent: true,
    opacity:     0.09,   // very faint
    depthWrite:  false,
  });
  const reflMesh = new THREE.Mesh(reflGeo, reflMat);

  // Mirror position: same Z, flipped Y below floor
  reflMesh.position.z    = -RADIUS;
  reflMesh.position.y    = -(CARD_H + 0.12);  // below the card
  reflMesh.rotation.x    = Math.PI;            // flip vertically
  reflMesh.renderOrder   = -1;

  base.add(reflMesh);
  group.userData.reflMesh = reflMesh;

  // Gradient fade for the reflection (dark at bottom)
  // We use a gradient canvas blended over it
  const fadeGeo = new THREE.PlaneGeometry(CARD_W, CARD_H * 0.7);
  const fadeCanvas = document.createElement("canvas");
  fadeCanvas.width = 4; fadeCanvas.height = 64;
  const ctx = fadeCanvas.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0,    "rgba(5,5,5,0)");
  g.addColorStop(0.5,  "rgba(5,5,5,0.6)");
  g.addColorStop(1,    "rgba(5,5,5,1)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 64);

  const fadeTex  = new THREE.CanvasTexture(fadeCanvas);
  const fadeMesh = new THREE.Mesh(fadeGeo, new THREE.MeshBasicMaterial({
    map: fadeTex, transparent: true, depthWrite: false,
  }));
  fadeMesh.position.z  = -RADIUS;
  fadeMesh.position.y  = -(CARD_H * 1.05);
  fadeMesh.rotation.x  = Math.PI;
  fadeMesh.renderOrder = 0;
  base.add(fadeMesh);
}

// ─── VIGNETTE (CSS — darkens left/right edges) ────────────
function buildVignette(container) {
  const v = document.createElement("div");
  v.style.cssText = `
    position: absolute; inset: 0; pointer-events: none; z-index: 5;
    background: radial-gradient(
      ellipse 70% 100% at 50% 50%,
      transparent 40%,
      rgba(5,5,5,0.55) 75%,
      rgba(5,5,5,0.92) 100%
    );
  `;
  container.appendChild(v);
}

// ─── DOM OVERLAY (title above, sub below) ─────────────────
function buildDomOverlay(container) {
  // Make container relative if not already
  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }

  domTitle = document.createElement("div");
  domTitle.style.cssText = `
    position: absolute; top: 9%; left: 0; right: 0;
    text-align: center; pointer-events: none; z-index: 10;
    font-family: "Instrument Serif", Georgia, serif;
    font-size: clamp(1.8rem, 3.2vw, 3rem);
    font-weight: 400; letter-spacing: 0.02em;
    color: rgba(227,227,219,0.92);
    text-shadow: 0 2px 24px rgba(0,0,0,0.7);
    transition: opacity 0.35s ease, transform 0.35s ease;
  `;

  domSub = document.createElement("div");
  domSub.style.cssText = `
    position: absolute; bottom: 9%; left: 0; right: 0;
    text-align: center; pointer-events: none; z-index: 10;
    font-family: "Instrument Serif", Georgia, serif;
    font-size: clamp(0.85rem, 1.3vw, 1.1rem);
    font-weight: 300; letter-spacing: 0.12em;
    color: rgba(227,227,219,0.42);
    text-shadow: 0 1px 12px rgba(0,0,0,0.6);
    transition: opacity 0.35s ease, transform 0.35s ease;
  `;

  container.appendChild(domTitle);
  container.appendChild(domSub);
}

function updateDomText(index, animate = true) {
  const proj = PROJECTS[index];
  if (!domTitle || !domSub) return;

  if (animate) {
    // Fade out
    domTitle.style.opacity   = "0";
    domTitle.style.transform = "translateY(-8px)";
    domSub.style.opacity     = "0";
    domSub.style.transform   = "translateY(8px)";

    setTimeout(() => {
      domTitle.textContent = proj.title;
      domSub.textContent   = proj.sub;
      // Fade in
      domTitle.style.opacity   = "1";
      domTitle.style.transform = "translateY(0)";
      domSub.style.opacity     = "1";
      domSub.style.transform   = "translateY(0)";
    }, 320); // halfway through the rotation (1.1s total)
  } else {
    domTitle.textContent     = proj.title;
    domSub.textContent       = proj.sub;
    domTitle.style.opacity   = "1";
    domTitle.style.transform = "translateY(0)";
    domSub.style.opacity     = "1";
    domSub.style.transform   = "translateY(0)";
  }
}

// ─── ROTATE ───────────────────────────────────────────────
function rotateToIndex(index) {
  if (isRotating) return;
  isRotating   = true;
  currentIndex = ((index % COUNT) + COUNT) % COUNT;

  // Update DOM text — fades out immediately, in at halfway
  updateDomText(currentIndex, true);

  gsap.to(rootNode.rotation, {
    y:          -currentIndex * STEP,
    duration:   1.1,
    ease:       "power3.inOut",
    onComplete: () => { isRotating = false; },
  });
}

// ─── ANIMATE LOOP ─────────────────────────────────────────
function animate() {
  if (!renderer || !scene || !camera) return;

  // Collect image meshes for hover raycasting
  const imageMeshes = [];
  rootNode.children.forEach(base => {
    const g = base.children[0];
    if (g?.userData.imageMesh) imageMeshes.push(g.userData.imageMesh);
  });

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(imageMeshes, false);
  hoveredCard = hits.length > 0 ? (hits[0].object.userData.parentGroup ?? null) : null;

  // Update cursor
  if (renderer.domElement) {
    renderer.domElement.style.cursor =
      hoveredCard && hoveredCard.userData.index === currentIndex ? "pointer" : "default";
  }

  rootNode.children.forEach((base, i) => {
    const group = base.children[0];
    if (!group) return;

    const state   = cardState[i];
    const isFront = i === currentIndex;
    const isHover = hoveredCard === group;

    // ── Scale: only front card scales on hover ────────────
    state.scaleTarget  = (isHover && isFront) ? 1.05 : 1.0;
    state.scaleCurrent = THREE.MathUtils.lerp(state.scaleCurrent, state.scaleTarget, 0.09);
    group.scale.setScalar(state.scaleCurrent);

    // ── Side-card dimming via image material color ────────
    // Cards further from front are dimmer (depth look)
    group.getWorldQuaternion(_worldQuat);
    group.getWorldPosition(_worldPos);
    _cardFwd.set(0, 0, 1).applyQuaternion(_worldQuat);
    _toCam.copy(camera.position).sub(_worldPos).normalize();
    const facing = _cardFwd.dot(_toCam); // 1 = facing camera, -1 = back

    // Dim non-front cards smoothly
    const brightness = THREE.MathUtils.lerp(0.18, 1.0,
      THREE.MathUtils.smoothstep(facing, 0.3, 0.85)
    );
    if (group.userData.imageMesh) {
      group.userData.imageMesh.material.color.setScalar(brightness);
    }

    // ── Border: front card slightly lighter ───────────────
    if (group.userData.borderMesh) {
      const opTarget  = isFront ? 0.85 : 0.28;
      const mat = group.userData.borderMesh.material;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, opTarget, 0.07);
      _col.set(isFront ? 0x4a4a45 : 0x141414);
      mat.color.lerp(_col, 0.07);
    }
  });

  renderer.render(scene, camera);
}

// ─── EXPORTS ──────────────────────────────────────────────
export function startThree() { isActive = true; }
export function stopThree()  { isActive = false; }
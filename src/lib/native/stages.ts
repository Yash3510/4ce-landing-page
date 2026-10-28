import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { PROJECTS } from "@/lib/shader-se/projects";

const ASSETS = "/sites/shader-se";
const FONT = '"STIX Two Text", "STIX Two Text Fallback", serif';

export const projectThumb = (playbackId: string) =>
  `${ASSETS}/api/mux-image/${playbackId}/w800-h600-fpreserve`;

export interface FrameState {
  progress: number;
  time: number;
  delta: number;
  pointer: THREE.Vector2;
}

export interface Stage {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** How much of the CRT bezel shows: 0 = full bleed, 1 = framed tube. */
  frame: number;
  update(state: FrameState): void;
  resize(aspect: number): void;
}

export interface StageContext {
  gltf: GLTFLoader;
  textures: THREE.TextureLoader;
  images: HTMLImageElement[];
  environment: THREE.Texture;
}

export function createContext(renderer: THREE.WebGLRenderer, manager: THREE.LoadingManager) {
  const draco = new DRACOLoader(manager).setDecoderPath(`${ASSETS}/draco/`);
  const gltf = new GLTFLoader(manager).setDRACOLoader(draco);
  const textures = new THREE.TextureLoader(manager);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return { gltf, textures, environment, draco };
}

export function loadImages(manager: THREE.LoadingManager) {
  const loader = new THREE.ImageLoader(manager);
  return Promise.all(PROJECTS.map((p) => loader.loadAsync(projectThumb(p.mux_playback_id))));
}

const damp = (current: number, target: number, lambda: number, delta: number) =>
  THREE.MathUtils.damp(current, target, lambda, delta);

function makeCamera(fov: number) {
  return new THREE.PerspectiveCamera(fov, 1, 0.05, 200);
}

// Narrow screens need a wider vertical FOV to keep the subject's width in frame.
function fitFov(camera: THREE.PerspectiveCamera, baseFov: number, aspect: number, minAspect: number) {
  camera.aspect = aspect;
  if (aspect >= minAspect) {
    camera.fov = baseFov;
  } else {
    const h = Math.tan(THREE.MathUtils.degToRad(baseFov / 2)) * minAspect;
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(h / aspect));
  }
  camera.updateProjectionMatrix();
}

function verticalGradient(stops: [number, string][]) {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    for (const [at, color] of stops) g.addColorStop(at, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function textPlane(text: string, width: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.font = `400 300px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255, 250, 224, 0.8)";
    ctx.shadowBlur = 24;
    ctx.fillStyle = "#fcf9f3";
    ctx.fillText(text, 1024, 270);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, width / 4),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false, toneMapped: false }),
  );
  mesh.renderOrder = 10;
  return mesh;
}

function smokeLayer(texture: THREE.Texture, size: number, opacity: number) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: "#b9b3c9",
    }),
  );
  return mesh;
}

/* ---------- Hero: retro computer floating in smoke ---------- */

export async function createHero(ctx: StageContext): Promise<Stage> {
  const [gltf, smoke] = await Promise.all([
    ctx.gltf.loadAsync(`${ASSETS}/models/computer.glb`),
    ctx.textures.loadAsync(`${ASSETS}/textures/smoke.webp`),
  ]);
  smoke.colorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#060608");
  scene.environment = ctx.environment;
  scene.environmentIntensity = 0.35;

  const model = gltf.scene;
  scene.add(model);
  const computer = model.getObjectByName("computer") ?? model;
  const box = new THREE.Box3().setFromObject(computer);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Screen content: project thumbnails cycling on a plane just in front of the glass.
  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 800;
  screenCanvas.height = 600;
  const screenCtx = screenCanvas.getContext("2d");
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.75),
    new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false }),
  );
  screen.scale.setScalar(size.x * 0.56);
  screen.position.set(center.x, box.min.y + size.y * 0.71, box.max.z - size.z * 0.38);
  screen.rotation.x = -0.12;
  scene.add(screen);

  let shown = -1;
  const drawScreen = (index: number) => {
    const image = ctx.images[index];
    if (!screenCtx || !image || index === shown) return;
    shown = index;
    screenCtx.drawImage(image, 0, 0, 800, 600);
    screenCtx.fillStyle = "rgba(40, 60, 140, 0.18)";
    screenCtx.fillRect(0, 0, 800, 600);
    screenTexture.needsUpdate = true;
  };

  const smokes = [
    { mesh: smokeLayer(smoke, size.x * 6, 0.32), speed: 0.012, y: -0.2 },
    { mesh: smokeLayer(smoke, size.x * 5, 0.22), speed: -0.018, y: 0.1 },
    { mesh: smokeLayer(smoke, size.x * 7, 0.18), speed: 0.008, y: 0.4 },
  ];
  smokes.forEach(({ mesh, y }, i) => {
    mesh.position.set(center.x - size.x * 0.6, center.y + size.y * y, box.min.z - size.z * (1 + i));
    scene.add(mesh);
  });

  const key = new THREE.SpotLight("#fff1d6", 60, 0, 0.6, 0.6);
  key.position.set(center.x - size.x, box.max.y + size.y * 1.5, box.max.z + size.z * 2);
  key.target.position.copy(center);
  scene.add(key, key.target, new THREE.AmbientLight("#9aa0c0", 0.5));
  const glow = new THREE.PointLight("#9ec7ff", 4, size.x * 3);
  glow.position.set(center.x, screen.position.y, screen.position.z + size.z * 0.6);
  scene.add(glow);

  const camera = makeCamera(32);
  const look = center.clone().add(new THREE.Vector3(-size.x * 0.55, size.y * 0.05, 0));
  const start = new THREE.Vector3(center.x - size.x * 0.75, center.y + size.y * 0.35, center.z + size.x * 2.6);
  const zoom = new THREE.Vector3(screen.position.x, screen.position.y, screen.position.z + size.x * 0.75);
  const pos = new THREE.Vector3();
  const target = new THREE.Vector3();
  const lookNow = look.clone();
  let narrow = false;

  return {
    scene,
    camera,
    frame: 0,
    resize(aspect) {
      narrow = aspect < 0.9;
      fitFov(camera, 32, aspect, 1.2);
    },
    update({ progress, time, delta, pointer }) {
      drawScreen(Math.floor(time / 3) % ctx.images.length);
      smokes.forEach(({ mesh, speed }, i) => {
        mesh.rotation.z = time * speed;
        mesh.position.x += Math.sin(time * 0.1 + i) * 0.0005;
      });
      // Scroll dollies the camera into the monitor glass before the cut to the work reel.
      const dolly = THREE.MathUtils.smoothstep(progress, 0.15, 1);
      const baseLook = narrow ? screen.position : look;
      target.lerpVectors(narrow ? zoom.clone().setZ(start.z) : start, zoom, dolly);
      target.x += pointer.x * size.x * 0.08 * (1 - dolly);
      target.y += pointer.y * size.y * 0.05 * (1 - dolly);
      pos.set(
        damp(camera.position.x, target.x, 4, delta),
        damp(camera.position.y, target.y, 4, delta),
        damp(camera.position.z, target.z, 4, delta),
      );
      camera.position.copy(pos);
      lookNow.lerpVectors(baseLook, screen.position, dolly);
      camera.lookAt(lookNow);
    },
  };
}

/* ---------- Work: film strip reel of projects ---------- */

export const STRIP_CELLS = PROJECTS.length;

export function createWork(ctx: StageContext): Stage {
  const cellW = 360;
  const cellH = 336;
  const canvas = document.createElement("canvas");
  canvas.width = cellW * STRIP_CELLS;
  canvas.height = cellH;
  const c = canvas.getContext("2d");
  if (c) {
    c.fillStyle = "#0b0b0d";
    c.fillRect(0, 0, canvas.width, cellH);
    c.fillStyle = "#cfc6b0";
    for (let x = 6; x < canvas.width; x += 24) {
      c.fillRect(x, 14, 12, 18);
      c.fillRect(x, cellH - 32, 12, 18);
    }
    ctx.images.forEach((image, i) => c.drawImage(image, i * cellW + 10, 48, cellW - 20, cellH - 96));
  }
  const strip = new THREE.CanvasTexture(canvas);
  strip.colorSpace = THREE.SRGBColorSpace;
  strip.anisotropy = 8;

  const radius = 3;
  const height = (2 * Math.PI * radius * cellH) / canvas.width;
  const reel = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 160, 1, true),
    new THREE.MeshBasicMaterial({ map: strip, side: THREE.DoubleSide, toneMapped: false }),
  );
  const tilt = new THREE.Group();
  tilt.rotation.set(0.16, 0, -0.2);
  tilt.add(reel);

  const scene = new THREE.Scene();
  scene.background = verticalGradient([
    [0, "#050514"],
    [0.55, "#1b2463"],
    [1, "#5a8fcc"],
  ]);
  scene.add(tilt);

  const camera = makeCamera(38);
  camera.position.set(0, 0.5, 8.2);
  camera.lookAt(0, 0, 0);
  let spin = 0;

  return {
    scene,
    camera,
    frame: 1,
    resize(aspect) {
      fitFov(camera, 38, aspect, 1.5);
    },
    update({ progress, delta, pointer }) {
      // Scroll steps the reel so each project lands facing the camera in turn.
      const goal = -progress * 2 * Math.PI * ((STRIP_CELLS - 1) / STRIP_CELLS) - Math.PI / STRIP_CELLS;
      spin = damp(spin, goal, 3, delta);
      reel.rotation.y = spin;
      tilt.rotation.x = damp(tilt.rotation.x, 0.16 + pointer.y * 0.05, 3, delta);
      tilt.rotation.z = damp(tilt.rotation.z, -0.2 + pointer.x * 0.04, 3, delta);
    },
  };
}

export function facingProject(progress: number) {
  return Math.min(STRIP_CELLS - 1, Math.round(progress * (STRIP_CELLS - 1)));
}

/* ---------- Office: endless cubicle farm under an "About Us" title ---------- */

export async function createOffice(ctx: StageContext): Promise<Stage> {
  const gltf = await ctx.gltf.loadAsync(`${ASSETS}/models/deskbox.glb`);
  gltf.scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = box.getSize(new THREE.Vector3());

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e9e4da");
  scene.fog = new THREE.Fog("#e9e4da", size.x * 6, size.x * 16);
  scene.add(new THREE.HemisphereLight("#ffffff", "#8c8a86", 2.4));
  const sun = new THREE.DirectionalLight("#fff6e6", 1.6);
  sun.position.set(1, 3, 2);
  scene.add(sun);

  const cols = 9;
  const rows = 16;
  const grid = new THREE.Matrix4();
  gltf.scene.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const instanced = new THREE.InstancedMesh(o.geometry, o.material, cols * rows);
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        grid.makeTranslation((col - (cols - 1) / 2) * size.x, 0, -r * size.z);
        instanced.setMatrixAt(n++, grid.clone().multiply(o.matrixWorld));
      }
    }
    scene.add(instanced);
  });

  const camera = makeCamera(45);
  scene.add(camera);
  const title = textPlane("About Us", 2.4);
  title.position.set(0, 0.25, -2.5);
  camera.add(title);
  const titleMaterial = title.material;

  const height = size.y * 4.5;
  const span = size.z * (rows - 6);
  const look = new THREE.Vector3();

  return {
    scene,
    camera,
    frame: 1,
    resize(aspect) {
      fitFov(camera, 45, aspect, 1.3);
      title.scale.setScalar(aspect < 1 ? Math.max(aspect, 0.55) : 1);
    },
    update({ progress, delta, pointer }) {
      const z = size.z * 2 - progress * span;
      camera.position.set(
        damp(camera.position.x, pointer.x * size.x * 0.3, 3, delta),
        height,
        damp(camera.position.z, z, 3, delta),
      );
      look.set(0, 0, camera.position.z - size.z * 3);
      camera.lookAt(look);
      titleMaterial.opacity = THREE.MathUtils.smoothstep(progress, 0.02, 0.2) * (1 - THREE.MathUtils.smoothstep(progress, 0.7, 0.95));
    },
  };
}

/* ---------- Golden tie: the deal-closer ---------- */

export async function createTie(ctx: StageContext): Promise<Stage> {
  const gltf = await ctx.gltf.loadAsync(`${ASSETS}/models/tie.glb`);
  const tie = gltf.scene;
  const gold = new THREE.MeshStandardMaterial({ color: "#e5b84c", metalness: 1, roughness: 0.28 });
  tie.traverse((o) => {
    if (o instanceof THREE.Mesh) o.material = gold;
  });
  const box = new THREE.Box3().setFromObject(tie);
  const size = box.getSize(new THREE.Vector3());
  tie.position.sub(box.getCenter(new THREE.Vector3()));
  const pivot = new THREE.Group();
  pivot.scale.setScalar(3 / Math.max(size.x, size.y, size.z));
  pivot.add(tie);

  const scene = new THREE.Scene();
  scene.background = verticalGradient([
    [0, "#0d0e12"],
    [1, "#22252c"],
  ]);
  scene.environment = ctx.environment;
  scene.environmentIntensity = 1.2;
  const key = new THREE.SpotLight("#fff2cc", 90, 0, 0.5, 0.5);
  key.position.set(2, 4, 4);
  scene.add(pivot, key);

  const camera = makeCamera(35);
  camera.position.set(0, 0, 6.5);

  return {
    scene,
    camera,
    frame: 1,
    resize(aspect) {
      fitFov(camera, 35, aspect, 0.8);
    },
    update({ progress, time, delta, pointer }) {
      pivot.rotation.y = time * 0.4 + progress * Math.PI * 2;
      pivot.rotation.x = damp(pivot.rotation.x, pointer.y * 0.3, 3, delta);
      pivot.position.y = Math.sin(time * 0.8) * 0.08;
      const s = 0.6 + THREE.MathUtils.smoothstep(progress, 0, 0.35) * 0.4;
      pivot.scale.setScalar((3 / Math.max(size.x, size.y, size.z)) * s);
    },
  };
}

/* ---------- Contact: a table of brick phones ---------- */

export async function createContact(ctx: StageContext): Promise<Stage> {
  const gltf = await ctx.gltf.loadAsync(`${ASSETS}/models/phones.glb`);
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model.getObjectByName("phones") ?? model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0b0b0e");
  scene.environment = ctx.environment;
  scene.environmentIntensity = 0.6;
  const key = new THREE.SpotLight("#fff1d6", 50, 0, 0.7, 0.6);
  key.position.set(center.x + size.x, center.y + size.y * 4, center.z + size.z * 3);
  key.target.position.copy(center);
  scene.add(model, key, key.target, new THREE.AmbientLight("#8088a8", 0.6));

  const camera = makeCamera(30);
  const radius = Math.max(size.x, size.y) * 2.6;
  let angle = 0;

  return {
    scene,
    camera,
    frame: 1,
    resize(aspect) {
      fitFov(camera, 30, aspect, 1.3);
    },
    update({ progress, delta, pointer }) {
      angle = damp(angle, (progress - 0.5) * 0.6 + pointer.x * 0.2, 3, delta);
      camera.position.set(
        center.x + Math.sin(angle) * radius,
        center.y + size.y * (1.2 + pointer.y * 0.3),
        center.z + Math.cos(angle) * radius,
      );
      camera.lookAt(center.x, center.y - size.y * 0.15, center.z);
    },
  };
}

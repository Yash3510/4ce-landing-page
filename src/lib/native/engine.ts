import * as THREE from "three";
import Lenis from "lenis";
import { createCrtMaterial } from "./crt";
import {
  createContact,
  createContext,
  createHero,
  createOffice,
  createTie,
  createWork,
  facingProject,
  loadImages,
  type Stage,
} from "./stages";

const STAGE_IDS = ["hero", "work", "office", "tie", "contact"] as const;
export type StageId = (typeof STAGE_IDS)[number];
const isStageId = (value: string | undefined): value is StageId =>
  STAGE_IDS.some((id) => id === value);

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  /** Scroll sections; each carries `data-stage` naming the scene shown behind it. */
  sections: HTMLElement[];
  onLoadProgress(fraction: number): void;
  onReady(webgl: boolean): void;
  onProject(index: number): void;
}

const TRANSITION_SECONDS = 0.32;

export function startEngine(opts: EngineOptions) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = reducedMotion
    ? null
    : new Lenis({ autoRaf: false, anchors: true, duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: opts.canvas, antialias: false, powerPreference: "high-performance" });
  } catch {
    // No WebGL: the HTML layer still carries all content.
    opts.onReady(false);
    let raf = requestAnimationFrame(function loop(t) {
      lenis?.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const crt = createCrtMaterial(target.texture);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), crt);
  const quadScene = new THREE.Scene().add(quad);
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, loaded, total) => opts.onLoadProgress(loaded / total);
  const { gltf, textures, environment, draco } = createContext(renderer, manager);

  const stages = new Map<StageId, Stage>();
  const pointer = new THREE.Vector2();
  const pointerGoal = new THREE.Vector2();
  let disposed = false;
  let shownId: StageId = "hero";
  let transition = 0;
  let switching = false;
  let lastProject = -1;
  let raf = 0;
  const timer = new THREE.Timer();

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    target.setSize(Math.floor(w * dpr), Math.floor(h * dpr));
    crt.uniforms.resolution.value.set(w * dpr, h * dpr);
    crt.uniforms.pixelRatio.value = dpr;
    stages.forEach((s) => s.resize(w / h));
  };

  const onPointer = (e: PointerEvent) => {
    pointerGoal.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  };

  // Which section owns the viewport centre, and how far through it we are.
  const readScroll = () => {
    const vh = window.innerHeight;
    const progress = new Map<StageId, number>();
    let active: StageId = "hero";
    for (const el of opts.sections) {
      const id = el.dataset.stage;
      if (!isStageId(id)) continue;
      const rect = el.getBoundingClientRect();
      // A later section can hold an earlier scene (About sits over the office); the first one drives progress.
      if (!progress.has(id)) progress.set(id, THREE.MathUtils.clamp(-rect.top / Math.max(rect.height - vh, 1), 0, 1));
      if (rect.top <= vh / 2 && rect.bottom > vh / 2) active = id;
    }
    return { progress, active };
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    lenis?.raf(now);
    timer.update(now);
    const delta = Math.min(timer.getDelta(), 0.1);
    const time = timer.getElapsed();
    pointer.lerp(pointerGoal, 1 - Math.exp(-4 * delta));

    const { progress, active } = readScroll();
    if (active !== shownId && stages.has(active)) switching = true;
    if (switching) {
      transition = Math.min(1, transition + delta / TRANSITION_SECONDS);
      if (transition >= 1) {
        shownId = stages.has(active) ? active : shownId;
        switching = false;
      }
    } else if (transition > 0) {
      transition = Math.max(0, transition - delta / TRANSITION_SECONDS);
    }

    const stage = stages.get(shownId);
    if (!stage) return;
    stage.update({ progress: progress.get(shownId) ?? 0, time, delta, pointer });

    const work = progress.get("work") ?? 0;
    const project = facingProject(work);
    if (project !== lastProject) {
      lastProject = project;
      opts.onProject(project);
    }

    crt.uniforms.time.value = reducedMotion ? 0 : time;
    crt.uniforms.transition.value = reducedMotion ? 0 : transition * transition * (3 - 2 * transition);
    crt.uniforms.frame.value = THREE.MathUtils.damp(crt.uniforms.frame.value, stage.frame, 6, delta);

    renderer.setRenderTarget(target);
    renderer.render(stage.scene, stage.camera);
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCamera);
  };

  (async () => {
    // Thumbnails stream in alongside the hero model; the hero screen copes with an empty list.
    const images: HTMLImageElement[] = [];
    const ctx = { gltf, textures, images, environment };
    const imagesReady = loadImages(manager).then((list) => images.push(...list));
    const others = Promise.all([createOffice(ctx), createTie(ctx), createContact(ctx)]);
    const hero = await createHero(ctx);
    if (disposed) return;
    stages.set("hero", hero);
    resize();
    opts.onReady(true);
    await imagesReady;
    if (disposed) return;
    stages.set("work", createWork(ctx));
    const rest = await others;
    if (disposed) return;
    stages.set("office", rest[0]);
    stages.set("tie", rest[1]);
    stages.set("contact", rest[2]);
    resize();
  })().catch((error: unknown) => {
    console.error("3D scene failed to load", error);
    opts.onReady(false);
  });

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointer);
  raf = requestAnimationFrame(frame);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointer);
    lenis?.destroy();
    draco.dispose();
    stages.forEach(({ scene }) =>
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      }),
    );
    environment.dispose();
    target.dispose();
    crt.dispose();
    renderer.dispose();
  };
}

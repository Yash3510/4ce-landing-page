"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { CRTShader } from "@/lib/shader-se/crtShader";
import { PROJECTS } from "@/lib/shader-se/projects";

interface ShaderCanvasProps {
  scrollProgress: number; // In page units: 0 to ~22.16
  subPage?: string | null;
  onSectionChange?: (section: string) => void;
  onLoaded?: () => void;
}

export function ShaderCanvas({
  scrollProgress,
  subPage = null,
  onSectionChange,
  onLoaded,
}: ShaderCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(scrollProgress);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Offscreen render target for the 3D scene
    const renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth * Math.min(window.devicePixelRatio, 1.5),
      window.innerHeight * Math.min(window.devicePixelRatio, 1.5),
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      }
    );

    // 1. Post-Processing CRT Setup
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postScene = new THREE.Scene();
    const crtMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(CRTShader.uniforms),
      vertexShader: CRTShader.vertexShader,
      fragmentShader: CRTShader.fragmentShader,
    });
    crtMaterial.uniforms.tDiffuse.value = renderTarget.texture;
    crtMaterial.uniforms.uDimensions.value.set(window.innerWidth, window.innerHeight);

    // Load boot screen texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("/textures/boot_screen.png", (tex) => {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      crtMaterial.uniforms.tBoot.value = tex;
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), crtMaterial);
    postScene.add(quad);

    // 2. Main 3D Scenes Setup
    const mainCamera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    mainCamera.position.set(0, 0.2, 4.5);
    mainCamera.lookAt(0, 0, 0);

    const mainScene = new THREE.Scene();
    mainScene.background = new THREE.Color(0x0a0a0c);

    // Global Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    mainScene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffeedd, 2.5);
    dirLight1.position.set(4, 5, 4);
    mainScene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7799ff, 1.5);
    dirLight2.position.set(-4, 2, 3);
    mainScene.add(dirLight2);

    // Loader & Assets with DRACO decompression
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // Scene Groups
    const heroGroup = new THREE.Group();
    const projectsGroup = new THREE.Group();
    const officeGroup = new THREE.Group();
    const aboutGroup = new THREE.Group();
    const goldenTieGroup = new THREE.Group();
    const contactGroup = new THREE.Group();
    const subPageGroup = new THREE.Group();

    mainScene.add(heroGroup);
    mainScene.add(projectsGroup);
    mainScene.add(officeGroup);
    mainScene.add(aboutGroup);
    mainScene.add(goldenTieGroup);
    mainScene.add(contactGroup);
    mainScene.add(subPageGroup);

    // Initial visibility
    projectsGroup.position.set(0, -100, 0);
    officeGroup.position.set(0, -200, 0);
    aboutGroup.position.set(0, -300, 0);
    goldenTieGroup.position.set(0, -400, 0);
    contactGroup.position.set(0, -500, 0);
    subPageGroup.position.set(0, -600, 0);

    // --- Hero Scene: Computer Model ---
    let computerModel: THREE.Object3D | null = null;
    gltfLoader.load("/models/computer.glb", (gltf) => {
      computerModel = gltf.scene;
      computerModel.scale.set(0.14, 0.14, 0.14);
      computerModel.position.set(-1.1, -1.4, 0);
      computerModel.rotation.set(0, Math.PI, 0);

      // Texture computer screen and background
      textureLoader.load("/textures/computer.webp", (screenTex) => {
        screenTex.colorSpace = THREE.SRGBColorSpace;
        computerModel?.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.name === "Cube") {
              mesh.material = new THREE.MeshStandardMaterial({
                color: 0x050508,
                roughness: 0.9,
                metalness: 0.1,
              });
            }
          }
        });

        const screenGroup = new THREE.Group();
        screenGroup.position.set(-22, 11, 2);
        screenGroup.rotation.y = Math.PI - 0.735;

        const screenMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(10.15, 7.875),
          new THREE.MeshBasicMaterial({ map: screenTex })
        );
        screenMesh.position.set(-0.2, -0.55, 0.1);
        screenMesh.rotation.x = -0.07;
        screenGroup.add(screenMesh);
        computerModel?.add(screenGroup);
      });

      heroGroup.add(computerModel);
    });

    // Smoke Background Plane
    textureLoader.load("/textures/smoke.webp", (smokeTex) => {
      smokeTex.wrapS = THREE.RepeatWrapping;
      smokeTex.wrapT = THREE.RepeatWrapping;
      const smokeGeo = new THREE.PlaneGeometry(16, 10);
      const smokeMat = new THREE.MeshBasicMaterial({
        map: smokeTex,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const smokeMesh = new THREE.Mesh(smokeGeo, smokeMat);
      smokeMesh.position.set(0, 0, -2);
      heroGroup.add(smokeMesh);
    });

    // --- Projects Scene: 3D Cylindrical Film Strip Carousel ---
    const carouselRadius = 4.2;
    const cardWidth = 2.0;
    const cardHeight = 1.35;
    const projectCards: THREE.Mesh[] = [];

    PROJECTS.forEach((project, idx) => {
      const angle = (idx / PROJECTS.length) * Math.PI * 2;
      const cardGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
      const cardMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.1,
      });

      // Load thumbnail
      textureLoader.load(
        `/api/mux-image/${project.mux_playback_id}/w800-h600-fpreserve`,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          cardMat.map = tex;
          cardMat.needsUpdate = true;
        },
        undefined,
        () => {
          // Fallback thumbnail
          textureLoader.load("/textures/thumb_fallback.png", (fb) => {
            cardMat.map = fb;
            cardMat.needsUpdate = true;
          });
        }
      );

      const card = new THREE.Mesh(cardGeo, cardMat);
      card.position.set(
        Math.sin(angle) * carouselRadius,
        0,
        Math.cos(angle) * carouselRadius
      );
      card.rotation.y = angle + Math.PI;
      projectsGroup.add(card);
      projectCards.push(card);
    });

    // --- Office Scene: Deskbox Grid ---
    let deskboxMesh: THREE.Object3D | null = null;
    gltfLoader.load("/models/deskbox.glb", (gltf) => {
      deskboxMesh = gltf.scene;
      const gridCount = 4;
      const spacing = 2.6;
      for (let x = -gridCount / 2; x < gridCount / 2; x++) {
        for (let z = -gridCount / 2; z < gridCount / 2; z++) {
          const clone = deskboxMesh.clone();
          clone.position.set(x * spacing, -1.2, z * spacing - 3);
          clone.scale.set(0.65, 0.65, 0.65);
          officeGroup.add(clone);
        }
      }
    });

    // --- About Us Scene: Paper Surface & Cutouts ---
    const paperGeo = new THREE.PlaneGeometry(16, 12);
    const paperMat = new THREE.MeshBasicMaterial({ color: 0xfcf9f3 });
    const paperMesh = new THREE.Mesh(paperGeo, paperMat);
    paperMesh.position.set(0, 0, 0);
    aboutGroup.add(paperMesh);

    // Team Cutouts
    const cutoutTextures = [
      { path: "/textures/jacob_presenting.webp", x: -2.2, y: 0.2, w: 2.2, h: 2.6 },
      { path: "/textures/simon_presenting.webp", x: 2.2, y: 0.2, w: 2.2, h: 2.6 },
      { path: "/textures/filip_footer_5.webp", x: 0, y: -0.8, w: 2.5, h: 2.8 },
    ];

    cutoutTextures.forEach(({ path, x, y, w, h }) => {
      textureLoader.load(path, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
        mesh.position.set(x, y, 0.1);
        aboutGroup.add(mesh);
      });
    });

    // Models: phones & shredder
    gltfLoader.load("/models/phones.glb", (gltf) => {
      const phones = gltf.scene;
      phones.position.set(2.5, -1.0, 0.5);
      phones.scale.set(0.8, 0.8, 0.8);
      aboutGroup.add(phones);
    });

    gltfLoader.load("/models/shredder.glb", (gltf) => {
      const shredder = gltf.scene;
      shredder.position.set(-2.5, -1.0, 0.5);
      shredder.scale.set(0.8, 0.8, 0.8);
      aboutGroup.add(shredder);
    });

    // --- Golden Tie Scene: Floating Tie & Bank Vault ---
    let tieModel: THREE.Object3D | null = null;
    gltfLoader.load("/models/tie.glb", (gltf) => {
      tieModel = gltf.scene;
      tieModel.scale.set(1.4, 1.4, 1.4);
      tieModel.position.set(0, 0, 1.5);
      // Give it gold shader material
      tieModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.95,
            roughness: 0.15,
          });
        }
      });
      goldenTieGroup.add(tieModel);
    });

    gltfLoader.load("/models/bank.glb", (gltf) => {
      const bank = gltf.scene;
      bank.position.set(0, -1.5, -2);
      bank.scale.set(1.2, 1.2, 1.2);
      goldenTieGroup.add(bank);
    });

    // --- Contact Scene: Desk & Certificates ---
    textureLoader.load("/textures/footer_certificate.png", (certTex) => {
      certTex.colorSpace = THREE.SRGBColorSpace;
      const certMat = new THREE.MeshBasicMaterial({
        map: certTex,
        transparent: true,
      });
      const certMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.2), certMat);
      certMesh.position.set(0, 0.3, 0);
      contactGroup.add(certMesh);
    });

    // --- Subpage Scene (/accessibility-statement) ---
    textureLoader.load("/textures/accessibility_statement.webp", (a11yTex) => {
      a11yTex.colorSpace = THREE.SRGBColorSpace;
      const a11yPaper = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 12),
        new THREE.MeshBasicMaterial({ color: 0xfcf9f3 })
      );
      subPageGroup.add(a11yPaper);

      const headerMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 1.2),
        new THREE.MeshBasicMaterial({ map: a11yTex, transparent: true })
      );
      headerMesh.position.set(0, 2.0, 0.1);
      subPageGroup.add(headerMesh);
    });

    // Loading Progress Simulation
    let bootProgress = 0;
    const bootStartTime = performance.now();

    // Mouse Tracking for Parallax Tilt
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Resize Handler
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      renderTarget.setSize(
        w * Math.min(window.devicePixelRatio, 1.5),
        h * Math.min(window.devicePixelRatio, 1.5)
      );
      mainCamera.aspect = w / h;
      mainCamera.updateProjectionMatrix();
      crtMaterial.uniforms.uDimensions.value.set(w, h);
    };
    window.addEventListener("resize", onResize);

    // Main Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      crtMaterial.uniforms.uTime.value += delta;

      // Boot screen progression (takes ~1.2s to compile & load)
      if (bootProgress < 100) {
        bootProgress = Math.min(100, (now - bootStartTime) / 12);
        crtMaterial.uniforms.uProgress.value = bootProgress;
        if (bootProgress >= 100) {
          crtMaterial.uniforms.uIsBoot.value = 0.0;
          onLoaded?.();
        } else {
          crtMaterial.uniforms.uIsBoot.value = 1.0;
        }
      }

      // Mouse Parallax Smooth Interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const p = progressRef.current; // Current scroll position

      // Subpage Mode Check
      if (subPage === "accessibility-statement") {
        subPageGroup.visible = true;
        heroGroup.visible = false;
        projectsGroup.visible = false;
        officeGroup.visible = false;
        aboutGroup.visible = false;
        goldenTieGroup.visible = false;
        contactGroup.visible = false;

        subPageGroup.position.set(0, 0, 0);
        mainCamera.position.set(0, 0, 5);
        crtMaterial.uniforms.uDistortion.value = 0.12;
      } else {
        subPageGroup.visible = false;
        heroGroup.visible = p <= 1.1;
        projectsGroup.visible = p >= 0.85 && p <= 2.15;
        officeGroup.visible = p >= 1.85 && p <= 3.95;
        aboutGroup.visible = p >= 3.65 && p <= 11.3;
        goldenTieGroup.visible = p >= 11.0 && p <= 19.0;
        contactGroup.visible = p >= 18.6;

        // Section Transitions according to scroll
        // Hero: [0, 1.0]
        if (p < 1.0) {
          onSectionChange?.("hero");
          heroGroup.position.set(0, -p * 6, 0);
          projectsGroup.position.set(0, Math.max(0, (1.0 - p) * 12), 0);
          officeGroup.position.set(0, -200, 0);
          aboutGroup.position.set(0, -300, 0);
          goldenTieGroup.position.set(0, -400, 0);
          contactGroup.position.set(0, -500, 0);

          if (computerModel) {
            computerModel.rotation.y = Math.PI + mouse.x * 0.12;
            computerModel.rotation.x = -mouse.y * 0.08;
          }
          crtMaterial.uniforms.uDistortion.value = 0.22;
        }
        // Projects Carousel: [1.0, 2.0]
        else if (p < 2.0) {
          onSectionChange?.("projects");
          heroGroup.position.set(0, -100, 0);
          const t = p - 1.0;
          projectsGroup.position.set(0, 0, 0);
          projectsGroup.rotation.y = t * Math.PI * 2;
          officeGroup.position.set(0, (1.0 - t) * 6, 0);
          aboutGroup.position.set(0, -300, 0);
          goldenTieGroup.position.set(0, -400, 0);
          contactGroup.position.set(0, -500, 0);

          crtMaterial.uniforms.uDistortion.value = 0.24;
        }
        // Office Grid: [2.0, 3.8]
        else if (p < 3.8) {
          onSectionChange?.("office");
          heroGroup.position.set(0, -100, 0);
          projectsGroup.position.set(0, -100, 0);
          officeGroup.position.set(0, 0, 0);
          aboutGroup.position.set(0, (3.8 - p) * 4, 0);
          goldenTieGroup.position.set(0, -400, 0);
          contactGroup.position.set(0, -500, 0);

          mainCamera.position.set(mouse.x * 0.5, 4.0 - (p - 2.0) * 1.5, 7.0 - (p - 2.0) * 2);
          mainCamera.lookAt(0, 0, 0);
          crtMaterial.uniforms.uDistortion.value = 0.18;
        }
        // About Us: [3.8, 11.14]
        else if (p < 11.14) {
          onSectionChange?.("about-us");
          heroGroup.position.set(0, -100, 0);
          projectsGroup.position.set(0, -100, 0);
          officeGroup.position.set(0, -200, 0);
          aboutGroup.position.set(0, 0, 0);
          goldenTieGroup.position.set(0, -400, 0);
          contactGroup.position.set(0, -500, 0);

          mainCamera.position.set(0, 0, 5);
          mainCamera.lookAt(0, 0, 0);
          crtMaterial.uniforms.uDistortion.value = 0.12;
        }
        // Golden Tie Reveal & Golden Tie: [11.14, 18.84]
        else if (p < 18.84) {
          onSectionChange?.("golden-tie");
          heroGroup.position.set(0, -100, 0);
          projectsGroup.position.set(0, -100, 0);
          officeGroup.position.set(0, -200, 0);
          aboutGroup.position.set(0, -300, 0);
          goldenTieGroup.position.set(0, 0, 0);
          contactGroup.position.set(0, -500, 0);

          if (tieModel) {
            tieModel.rotation.y += delta * 0.8;
            tieModel.position.y = Math.sin(now * 0.002) * 0.15;
          }
          mainCamera.position.set(mouse.x * 0.4, 0, 5);
          mainCamera.lookAt(0, 0, 0);
          crtMaterial.uniforms.uDistortion.value = 0.22;
        }
        // Contact: [18.84, 22.16]
        else {
          onSectionChange?.("contact");
          heroGroup.position.set(0, -100, 0);
          projectsGroup.position.set(0, -100, 0);
          officeGroup.position.set(0, -200, 0);
          aboutGroup.position.set(0, -300, 0);
          goldenTieGroup.position.set(0, -400, 0);
          contactGroup.position.set(0, 0, 0);

          mainCamera.position.set(0, 0, 5);
          mainCamera.lookAt(0, 0, 0);
          crtMaterial.uniforms.uDistortion.value = 0.15;
        }
      }

      // Step 1: Render 3D Scene into offscreen renderTarget
      renderer.setRenderTarget(renderTarget);
      renderer.render(mainScene, mainCamera);

      // Step 2: Render Post-Processing CRT Quad to Screen
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      renderTarget.dispose();
      crtMaterial.dispose();
      dracoLoader.dispose();
    };
  }, [subPage, onLoaded, onSectionChange]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen z-40 pointer-events-none"
    >
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", pointerEvents: "auto" }}>
        <div className="r3f-canvas-container" style={{ width: "100%", height: "100%" }}>
          <canvas
            ref={canvasRef}
            className="r3f-canvas"
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { CRTShader } from "@/lib/shader-se/crtShader";
import { PROJECTS } from "@/lib/shader-se/projects";

interface ShaderCanvasProps {
  scrollProgress: number; // 0 to ~22.16
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

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Offscreen render target for the 3D scene before CRT pass
    const renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth * dpr,
      window.innerHeight * dpr,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      }
    );

    // 2. Post-Processing CRT Setup
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postScene = new THREE.Scene();
    const crtMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(CRTShader.uniforms),
      vertexShader: CRTShader.vertexShader,
      fragmentShader: CRTShader.fragmentShader,
    });
    crtMaterial.uniforms.tDiffuse.value = renderTarget.texture;
    crtMaterial.uniforms.uDimensions.value.set(window.innerWidth, window.innerHeight);

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

    // 3. Main 3D Scene & Perspective Camera
    const mainCamera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      250
    );
    mainCamera.position.set(0, 0.2, 4.5);
    mainCamera.lookAt(0, 0, 0);

    const mainScene = new THREE.Scene();
    mainScene.background = new THREE.Color(0x08080a);

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

    // Global Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    mainScene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.5);
    keyLight.position.set(5, 8, 6);
    mainScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7090ff, 1.4);
    fillLight.position.set(-6, 3, 4);
    mainScene.add(fillLight);

    // Model Loader with DRACO decompression
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // -------------------------------------------------------------
    // SECTION 1: HERO (Computer Model & Smoke Atmosphere)
    // -------------------------------------------------------------
    let computerModel: THREE.Object3D | null = null;
    let screenMesh: THREE.Mesh | null = null;

    gltfLoader.load("/models/computer.glb", (gltf) => {
      computerModel = gltf.scene;
      computerModel.scale.set(0.14, 0.14, 0.14);
      computerModel.position.set(0.65, -1.35, 0.4);
      computerModel.rotation.set(0, Math.PI - 0.25, 0);

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

        screenMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(10.15, 7.875),
          new THREE.MeshBasicMaterial({ map: screenTex })
        );
        screenMesh.position.set(-0.2, -0.55, 0.1);
        screenMesh.rotation.x = -0.07;
        screenGroup.add(screenMesh);
        computerModel?.add(screenGroup);
      });

      // Luminous CRT glow light casting on keyboard and desk
      const screenPointLight = new THREE.PointLight(0xfff6ea, 3.8, 5.0);
      screenPointLight.position.set(0.65, -0.6, 1.4);
      heroGroup.add(screenPointLight);

      heroGroup.add(computerModel);
    });

    // Atmospheric Smoke Plane
    textureLoader.load("/textures/smoke.webp", (smokeTex) => {
      smokeTex.wrapS = THREE.RepeatWrapping;
      smokeTex.wrapT = THREE.RepeatWrapping;
      const smokeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(18, 12),
        new THREE.MeshBasicMaterial({
          map: smokeTex,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
        })
      );
      smokeMesh.position.set(0, 0, -2);
      heroGroup.add(smokeMesh);
    });

    // -------------------------------------------------------------
    // SECTION 2: PROJECTS (CatmullRomCurve3 Ribbon Filmstrip)
    // -------------------------------------------------------------
    const ribbonPoints = [
      new THREE.Vector3(-150, -40, -150),
      new THREE.Vector3(-90, -20, -35),
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(90, 20, -35),
      new THREE.Vector3(-49, 70, -211),
      new THREE.Vector3(100, 180, -300),
      new THREE.Vector3(-60, 200, -200),
    ].map((p) => p.clone().multiplyScalar(0.045).multiply(new THREE.Vector3(1, 1, 0.8)));

    const projectCurve = new THREE.CatmullRomCurve3(ribbonPoints, false, "chordal", 1);
    const projectCards: THREE.Mesh[] = [];

    // Continuous 3D Filmstrip Ribbon Geometry along the Spline
    const ribbonGeo = new THREE.BufferGeometry();
    const ribbonVerts: number[] = [];
    const ribbonNormals: number[] = [];
    const ribbonUvs: number[] = [];
    const ribbonIndices: number[] = [];
    const ribbonSubdivs = 160;
    const ribbonHalfH = 0.75;

    for (let i = 0; i <= ribbonSubdivs; i++) {
      const alpha = i / ribbonSubdivs;
      const pt = projectCurve.getPointAt(alpha);
      const tangent = projectCurve.getTangentAt(alpha);
      const up = new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      if (normal.lengthSq() < 0.001) {
        normal.crossVectors(tangent, new THREE.Vector3(0, 0, 1)).normalize();
      }
      const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

      ribbonVerts.push(pt.x, pt.y - ribbonHalfH, pt.z);
      ribbonVerts.push(pt.x, pt.y + ribbonHalfH, pt.z);

      ribbonNormals.push(binormal.x, binormal.y, binormal.z > 0 ? -binormal.z : binormal.z);
      ribbonNormals.push(binormal.x, binormal.y, binormal.z > 0 ? -binormal.z : binormal.z);

      ribbonUvs.push(alpha, 0);
      ribbonUvs.push(alpha, 1);

      if (i < ribbonSubdivs) {
        const vIdx = 2 * i;
        ribbonIndices.push(vIdx, vIdx + 1, vIdx + 2);
        ribbonIndices.push(vIdx + 1, vIdx + 3, vIdx + 2);
      }
    }

    ribbonGeo.setIndex(ribbonIndices);
    ribbonGeo.setAttribute("position", new THREE.Float32BufferAttribute(ribbonVerts, 3));
    ribbonGeo.setAttribute("normal", new THREE.Float32BufferAttribute(ribbonNormals, 3));
    ribbonGeo.setAttribute("uv", new THREE.Float32BufferAttribute(ribbonUvs, 2));
    ribbonGeo.computeVertexNormals();

    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x111116,
      roughness: 0.5,
      metalness: 0.85,
      side: THREE.DoubleSide,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    projectsGroup.add(ribbonMesh);

    PROJECTS.slice(0, 8).forEach((project, idx) => {
      const t = idx / 7;
      const pt = projectCurve.getPointAt(t);
      const tangent = projectCurve.getTangentAt(t);

      const cardGeo = new THREE.PlaneGeometry(1.8, 1.2);
      const cardMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.2,
      });

      textureLoader.load(
        `/api/mux-image/${project.mux_playback_id}/w800-h600-fpreserve`,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          cardMat.map = tex;
          cardMat.needsUpdate = true;
        },
        undefined,
        () => {
          textureLoader.load("/textures/thumb_fallback.png", (fb) => {
            fb.colorSpace = THREE.SRGBColorSpace;
            cardMat.map = fb;
            cardMat.needsUpdate = true;
          });
        }
      );

      const card = new THREE.Mesh(cardGeo, cardMat);
      card.position.copy(pt);
      card.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent.clone().cross(new THREE.Vector3(0, 1, 0)).normalize());
      projectsGroup.add(card);
      projectCards.push(card);
    });

    // -------------------------------------------------------------
    // SECTION 3: OFFICE (Deskbox Workstation Matrix)
    // -------------------------------------------------------------
    gltfLoader.load("/models/deskbox.glb", (gltf) => {
      const deskboxMesh = gltf.scene;
      const count = 4;
      const spacing = 2.4;
      for (let x = -count / 2; x < count / 2; x++) {
        for (let z = -count / 2; z < count / 2; z++) {
          const clone = deskboxMesh.clone();
          clone.position.set(x * spacing, -1.0, z * spacing - 2);
          clone.scale.set(0.6, 0.6, 0.6);
          officeGroup.add(clone);
        }
      }
    });

    // -------------------------------------------------------------
    // SECTION 4: ABOUT US (Paper Surface & Shredder with Animated Cogs)
    // -------------------------------------------------------------
    const paperMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 20),
      new THREE.MeshBasicMaterial({ color: 0xfcf9f3 })
    );
    paperMesh.position.set(0, 0, -0.1);
    aboutGroup.add(paperMesh);

    // Team Cutouts
    const teamCutouts = [
      { path: "/textures/jacob_presenting.webp", x: -2.0, y: 0.4, w: 2.0, h: 2.5 },
      { path: "/textures/simon_presenting.webp", x: 2.0, y: 0.4, w: 2.0, h: 2.5 },
      { path: "/textures/filip_footer_5.webp", x: 0, y: -0.6, w: 2.3, h: 2.7 },
    ];
    teamCutouts.forEach(({ path, x, y, w, h }) => {
      textureLoader.load(path, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true })
        );
        mesh.position.set(x, y, 0.05);
        aboutGroup.add(mesh);
      });
    });

    let shredderModel: THREE.Object3D | null = null;
    let shredderCogs: THREE.Object3D | null = null;

    gltfLoader.load("/models/shredder.glb", (gltf) => {
      shredderModel = gltf.scene;
      shredderModel.scale.set(0.65, 0.65, 0.65);
      shredderModel.rotation.set(Math.PI / 2, 0, 0);
      shredderModel.position.set(0, -1.8, 0.3);

      shredderModel.traverse((child) => {
        if (child.name === "cogs") {
          shredderCogs = child;
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
              color: 0x999999,
              metalness: 0.95,
              roughness: 0.2,
            });
          }
        }
      });
      aboutGroup.add(shredderModel);
    });

    // -------------------------------------------------------------
    // SECTION 5: GOLDEN TIE & BANK VAULT (AnimationMixer Unlocking)
    // -------------------------------------------------------------
    let tieModel: THREE.Object3D | null = null;
    gltfLoader.load("/models/tie.glb", (gltf) => {
      tieModel = gltf.scene;
      tieModel.scale.set(1.4, 1.4, 1.4);
      tieModel.position.set(0, 0, 1.5);
      tieModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0.722, 0.525, 0.043),
            metalness: 0.9,
            roughness: 0.2,
            clearcoat: 0.1,
          });
        }
      });
      goldenTieGroup.add(tieModel);
    });

    let bankModel: THREE.Object3D | null = null;
    let bankMixer: THREE.AnimationMixer | null = null;
    let bankAction: THREE.AnimationAction | null = null;
    let bankClip: THREE.AnimationClip | null = null;

    gltfLoader.load("/models/bank.glb", (gltf) => {
      bankModel = gltf.scene;
      bankModel.scale.set(0.12, 0.12, 0.12);
      bankModel.position.set(0, -0.35, 0.0);

      // Texture materials for bank walls & metal
      const wallTex = textureLoader.load("/textures/bank_wall.webp");
      wallTex.colorSpace = THREE.SRGBColorSpace;
      wallTex.wrapS = THREE.RepeatWrapping;
      wallTex.wrapT = THREE.RepeatWrapping;

      const metalTex = textureLoader.load("/textures/bank_metal.webp");
      metalTex.colorSpace = THREE.SRGBColorSpace;
      metalTex.wrapS = THREE.RepeatWrapping;
      metalTex.wrapT = THREE.RepeatWrapping;

      bankModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.name === "render-plane") {
            mesh.scale.set(0, 0, 0);
            mesh.position.set(0, 0, -30);
          } else if (mesh.name.includes("wall")) {
            mesh.material = new THREE.MeshStandardMaterial({
              map: wallTex,
              roughness: 0.9,
              metalness: 0.6,
            });
          } else {
            mesh.material = new THREE.MeshStandardMaterial({
              map: metalTex,
              metalness: 0.95,
              roughness: 0.3,
            });
          }
        }
      });

      // AnimationMixer running the 'Scene' clip
      if (gltf.animations.length > 0) {
        bankClip = gltf.animations.find((a) => a.name === "Scene") || gltf.animations[0];
        bankMixer = new THREE.AnimationMixer(bankModel);
        bankAction = bankMixer.clipAction(bankClip);
        bankAction.play();
      }

      goldenTieGroup.add(bankModel);
    });

    // Vault Directional Spotlight from decoded spec
    const vaultTarget = new THREE.Object3D();
    vaultTarget.position.set(0, -0.6, 0);
    goldenTieGroup.add(vaultTarget);

    const vaultSpotLight = new THREE.SpotLight(0xffffff, 2.2, 30, 0.25, 1.2, 0.001);
    vaultSpotLight.position.set(0, 4.5, 4);
    vaultSpotLight.target = vaultTarget;
    goldenTieGroup.add(vaultSpotLight);

    // -------------------------------------------------------------
    // SECTION 6: CONTACT (Telephones with Emissive Lamps & Ring Wobble)
    // -------------------------------------------------------------
    let phonesModel: THREE.Object3D | null = null;
    let redLampMat: THREE.MeshStandardMaterial | null = null;
    let greenLampMat: THREE.MeshStandardMaterial | null = null;

    gltfLoader.load("/models/phones.glb", (gltf) => {
      phonesModel = gltf.scene;
      phonesModel.scale.set(1.1, 1.1, 1.1);
      phonesModel.rotation.set(0.3, Math.PI, 0);
      phonesModel.position.set(0.9, -1.2, 0.5);

      phonesModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.name === "phone-2-lamp-red") {
            redLampMat = new THREE.MeshStandardMaterial({
              color: 0xff1111,
              emissive: 0xff0000,
              emissiveIntensity: 1.0,
            });
            mesh.material = redLampMat;
          } else if (mesh.name === "phone-2-lamp-green") {
            greenLampMat = new THREE.MeshStandardMaterial({
              color: 0x11ff33,
              emissive: 0x00ff22,
              emissiveIntensity: 1.5,
            });
            mesh.material = greenLampMat;
          }
        }
      });

      contactGroup.add(phonesModel);
    });

    // Certificate Plaque
    textureLoader.load("/textures/footer_certificate.png", (certTex) => {
      certTex.colorSpace = THREE.SRGBColorSpace;
      const certMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 3.1),
        new THREE.MeshBasicMaterial({ map: certTex, transparent: true })
      );
      certMesh.position.set(-1.8, 0.2, 0.2);
      contactGroup.add(certMesh);
    });

    // Subpage View
    textureLoader.load("/textures/accessibility_statement.webp", (a11yTex) => {
      a11yTex.colorSpace = THREE.SRGBColorSpace;
      const paper = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 12),
        new THREE.MeshBasicMaterial({ color: 0xfcf9f3 })
      );
      subPageGroup.add(paper);
      const titleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 1.2),
        new THREE.MeshBasicMaterial({ map: a11yTex, transparent: true })
      );
      titleMesh.position.set(0, 2.0, 0.1);
      subPageGroup.add(titleMesh);
    });

    // -------------------------------------------------------------
    // INTERACTION & ANIMATION LOOP
    // -------------------------------------------------------------
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      renderTarget.setSize(w * dpr, h * dpr);
      mainCamera.aspect = w / h;
      mainCamera.updateProjectionMatrix();
      crtMaterial.uniforms.uDimensions.value.set(w, h);
    };
    window.addEventListener("resize", onResize);

    let bootProgress = 0;
    const bootStartTime = performance.now();
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      crtMaterial.uniforms.uTime.value += delta;

      // Boot Screen Progression
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

      // Smooth Mouse Parallax Interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const p = progressRef.current;

      // Subpage Mode
      if (subPage === "accessibility-statement") {
        subPageGroup.visible = true;
        heroGroup.visible = false;
        projectsGroup.visible = false;
        officeGroup.visible = false;
        aboutGroup.visible = false;
        goldenTieGroup.visible = false;
        contactGroup.visible = false;
        mainCamera.position.set(0, 0, 5);
        mainCamera.lookAt(0, 0, 0);
        crtMaterial.uniforms.uDistortion.value = 0.08;
      } else {
        subPageGroup.visible = false;

        // Group visibility ranges with smooth cross-fading
        heroGroup.visible = p <= 1.2;
        projectsGroup.visible = p >= 0.7 && p <= 2.3;
        officeGroup.visible = p >= 1.7 && p <= 4.0;
        aboutGroup.visible = p >= 3.6 && p <= 11.5;
        goldenTieGroup.visible = p >= 10.8 && p <= 19.2;
        contactGroup.visible = p >= 18.5;

        // 1. HERO ($p \in [0, 1.0]$)
        if (p < 1.0) {
          onSectionChange?.("hero");
          const u = 1 - Math.pow(1 - Math.min(p / 0.85, 1.0), 1.4);

          // Camera zooms smoothly toward the computer display on the right
          mainCamera.position.set(
            THREE.MathUtils.lerp(0, 0.65, u) + mouse.x * (1 - u) * 0.25,
            THREE.MathUtils.lerp(0.2, -0.65, u) + mouse.y * (1 - u) * 0.2,
            THREE.MathUtils.lerp(4.5, 1.4, u)
          );
          mainCamera.lookAt(
            THREE.MathUtils.lerp(0, 0.65, u),
            THREE.MathUtils.lerp(0, -0.65, u),
            THREE.MathUtils.lerp(0, 0.4, u)
          );

          if (computerModel) {
            computerModel.rotation.y = Math.PI - 0.25 + mouse.x * 0.1 * (1 - u);
            computerModel.rotation.x = -mouse.y * 0.06 * (1 - u);
          }
          crtMaterial.uniforms.uDistortion.value = THREE.MathUtils.lerp(0.22, 0.20, u);
        }
        // 2. PROJECTS ($p \in [1.0, 2.0]$)
        else if (p < 2.0) {
          onSectionChange?.("projects");
          const t = p - 1.0;

          // Camera follows along the filmstrip ribbon path
          mainCamera.position.set(
            mouse.x * 0.35,
            -t * 0.8 + mouse.y * 0.25,
            5.0 - t * 1.5
          );
          mainCamera.lookAt(0, -t * 0.5, 0);

          // Cards float with gentle responsive angle
          projectCards.forEach((card, i) => {
            card.position.y += Math.sin(now * 0.002 + i) * 0.0008;
          });
          crtMaterial.uniforms.uDistortion.value = 0.20;
        }
        // 3. OFFICE ($p \in [2.0, 3.8]$)
        else if (p < 3.8) {
          onSectionChange?.("office");
          const tOff = (p - 2.0) / 1.8;

          // Camera descends over workstation matrix looking down
          mainCamera.position.set(
            mouse.x * 0.4,
            3.2 - tOff * 1.6,
            5.0 - tOff * 1.5
          );
          mainCamera.lookAt(0, 0, 0);
          crtMaterial.uniforms.uDistortion.value = 0.18;
        }
        // 4. ABOUT US ($p \in [3.8, 11.14]$)
        else if (p < 11.14) {
          onSectionChange?.("about-us");
          const aboutProg = Math.max(0, Math.min(1, (p - 3.8) / 7.34));

          mainCamera.position.set(mouse.x * 0.15, mouse.y * 0.15, 5.2);
          mainCamera.lookAt(0, 0, 0);

          // Shredder cogs rotate as you scroll down the page!
          if (shredderCogs) {
            shredderCogs.rotation.x = -aboutProg * Math.PI * 8;
          }
          if (shredderModel) {
            shredderModel.position.y = (aboutProg - 0.45) * 4.2;
          }
          crtMaterial.uniforms.uDistortion.value = 0.08;
        }
        // 5. GOLDEN TIE & BANK VAULT ($p \in [11.14, 18.84]$)
        else if (p < 18.84) {
          onSectionChange?.("golden-tie");
          const tVault = Math.max(0, Math.min(1, (p - 11.14) / 4.2));

          // Vault Door AnimationMixer driven by scroll
          if (bankMixer && bankClip && bankAction) {
            const doorProg = Math.max(0, Math.min(1, (tVault + 0.1) / 0.8));
            bankAction.time = doorProg * bankClip.duration;
            bankMixer.update(0);
          }

          // Golden Tie floating with subtle metallic rotation
          if (tieModel) {
            tieModel.position.set(0, 0.05, 1.8 - tVault * 2.2);
            tieModel.rotation.y += delta * 1.4;
            tieModel.rotation.z = Math.sin(now * 0.003) * 0.08;
          }

          // Camera glide into vault: from (0, 0.2, 4.0) to (0, -0.4, -0.5)
          const camStart = new THREE.Vector3(0, 0.2, 4.0);
          const camEnd = new THREE.Vector3(0, -0.4, -0.5);
          mainCamera.position.set(
            mouse.x * 0.2,
            camStart.y + (camEnd.y - camStart.y) * tVault + mouse.y * 0.15,
            camStart.z + (camEnd.z - camStart.z) * tVault
          );
          mainCamera.lookAt(0, -0.2, -1.0);
          crtMaterial.uniforms.uDistortion.value = 0.22;
        }
        // 6. CONTACT ($p \ge 18.84$)
        else {
          onSectionChange?.("contact");
          const tCon = Math.max(0, Math.min(1, (p - 18.84) / 3.32));

          mainCamera.position.set(
            mouse.x * 0.2,
            mouse.y * 0.2 - tCon * 0.4,
            5.0
          );
          mainCamera.lookAt(0, -tCon * 0.4, 0);

          // Telephones ringing wobble & alternating indicator lights
          if (phonesModel) {
            const isRinging = Math.sin(now * 0.005) > 0;
            const ring = isRinging ? Math.sin(now * 0.04) * 0.02 : 0;
            phonesModel.rotation.z = ring;
            phonesModel.position.x = 0.9 + ring * 0.3;
          }
          if (redLampMat) {
            redLampMat.emissiveIntensity = Math.sin(now * 0.009) > 0 ? 3.0 : 0.2;
          }
          if (greenLampMat) {
            greenLampMat.emissiveIntensity = Math.sin(now * 0.009) <= 0 ? 2.5 : 0.4;
          }

          crtMaterial.uniforms.uDistortion.value = 0.16;
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
      className="fixed inset-0 w-screen h-screen z-10 pointer-events-none select-none"
    >
      <div className="relative w-full h-full overflow-hidden pointer-events-none">
        <div className="r3f-canvas-container w-full h-full pointer-events-none">
          <canvas
            ref={canvasRef}
            className="r3f-canvas block w-full h-full pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}

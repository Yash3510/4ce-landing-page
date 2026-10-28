"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import { ShaderCanvas } from "@/components/sites/shader-se/ShaderCanvas";
import { UiOverlay } from "@/components/sites/shader-se/UiOverlay";

const TOTAL_SCROLL_PAGES = 22.16;

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState("hero");
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: true,
    });
    lenisRef.current = lenis;

    function onScroll(e: { progress: number }) {
      const progress = e.progress * TOTAL_SCROLL_PAGES;
      setScrollProgress(progress);
    }

    lenis.on("scroll", onScroll);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    if (!lenisRef.current) return;
    let targetProgress = 0;
    if (sectionId === "hero") targetProgress = 0;
    else if (sectionId === "projects") targetProgress = 1.0 / TOTAL_SCROLL_PAGES;
    else if (sectionId === "about-us") targetProgress = 3.8 / TOTAL_SCROLL_PAGES;
    else if (sectionId === "contact") targetProgress = 18.84 / TOTAL_SCROLL_PAGES;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    lenisRef.current.scrollTo(targetProgress * maxScroll, { duration: 1.5 });
  }, []);

  // UI Text color: light paper mode in About Us section (3.8 - 11.14), dark CRT everywhere else
  const isDark = currentSection !== "about-us";

  return (
    <main className="relative w-full min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      {/* Native WebGL Three.js Canvas with CRT Post-Processing Pass */}
      <ShaderCanvas
        scrollProgress={scrollProgress}
        onSectionChange={setCurrentSection}
      />

      {/* Responsive Interactive UI Overlay */}
      <UiOverlay
        currentSection={currentSection}
        isDark={isDark}
        onNavigate={handleNavigate}
      />

      {/* Virtual Scroll Height Track */}
      <div
        id="scroll-container"
        className="pointer-events-none w-full"
        style={{ height: `${TOTAL_SCROLL_PAGES * 100}vh` }}
        aria-hidden="true"
      />
    </main>
  );
}

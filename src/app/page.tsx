"use client";

import React, { useState, useCallback, useRef } from "react";
import { ShaderCanvas } from "@/components/sites/shader-se/ShaderCanvas";
import { UiOverlay } from "@/components/sites/shader-se/UiOverlay";
import { LenisController } from "@/components/sites/shader-se/LenisController";

const TOTAL_SCROLL_PAGES = 22.16;

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState("hero");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((progress: number) => {
    setScrollProgress(progress);
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    const el = document.getElementById("scroll-container");
    if (!el) return;
    const vh = window.innerHeight;
    let target = 0;
    if (sectionId === "hero") target = 0;
    else if (sectionId === "projects") target = vh * 1.0;
    else if (sectionId === "about-us") target = vh * 3.8;
    else if (sectionId === "golden-tie") target = vh * 12.0;
    else if (sectionId === "contact") target = vh * 18.84;

    el.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  // Light paper mode in About Us section (3.8 - 11.14), dark CRT elsewhere
  const isDark = currentSection !== "about-us";

  return (
    <main className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* 1. Native Three.js WebGL Canvas with CRT Post-Processing Pass */}
      <ShaderCanvas
        scrollProgress={scrollProgress}
        onSectionChange={setCurrentSection}
      />

      {/* 2. Interactive Navigation & UI Overlay */}
      <UiOverlay
        currentSection={currentSection}
        isDark={isDark}
        onNavigate={handleNavigate}
      />

      {/* 3. Lenis Smooth Scroll Controller */}
      <LenisController onScroll={handleScroll} />

      {/* 4. Virtual Scroll Height Track */}
      <div
        id="scroll-container"
        ref={scrollContainerRef}
        className="fixed inset-0 w-screen h-screen overflow-y-auto overflow-x-hidden overscroll-none z-40 touch-pan-y pointer-events-auto"
        tabIndex={-1}
      >
        <div
          id="scroll-track"
          style={{ height: `${TOTAL_SCROLL_PAGES * 100}vh`, width: "100%" }}
          aria-hidden="true"
        />
      </div>
    </main>
  );
}

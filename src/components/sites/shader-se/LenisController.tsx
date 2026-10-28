"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

interface LenisControllerProps {
  onScroll?: (progress: number, velocity: number) => void;
}

export function LenisController({ onScroll }: LenisControllerProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const scrollContainer = document.getElementById("scroll-container");
    const scrollTrack = document.getElementById("scroll-track");
    if (!scrollContainer) return;

    const lenis = new Lenis({
      wrapper: scrollContainer,
      content: scrollTrack || (scrollContainer.firstElementChild as HTMLElement),
      orientation: "vertical",
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.08,
      touchMultiplier: 1.2,
      wheelMultiplier: 1.0,
    });

    lenisRef.current = lenis;

    const handleScroll = (e: { scroll: number; velocity: number }) => {
      const vh = window.innerHeight;
      const progress = e.scroll / Math.max(vh, 1);
      onScroll?.(progress, e.velocity);
    };

    lenis.on("scroll", handleScroll);

    // Native scroll fallback listener
    const handleNativeScroll = () => {
      const vh = window.innerHeight;
      const progress = scrollContainer.scrollTop / Math.max(vh, 1);
      onScroll?.(progress, 0);
    };
    scrollContainer.addEventListener("scroll", handleNativeScroll, { passive: true });

    // Global wheel fallback ensuring wheel events anywhere drive scrolling
    const handleWindowWheel = (e: WheelEvent) => {
      if (scrollContainer && !e.defaultPrevented) {
        scrollContainer.scrollTop += e.deltaY;
        const vh = window.innerHeight;
        const progress = scrollContainer.scrollTop / Math.max(vh, 1);
        onScroll?.(progress, e.deltaY);
      }
    };
    window.addEventListener("wheel", handleWindowWheel, { passive: true });

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      const vh = window.innerHeight;
      if (e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
        e.preventDefault();
        lenis.scrollTo(scrollContainer.scrollTop + vh);
      } else if (e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
        e.preventDefault();
        lenis.scrollTo(Math.max(0, scrollContainer.scrollTop - vh));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        lenis.scrollTo(scrollContainer.scrollTop + 140);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        lenis.scrollTo(Math.max(0, scrollContainer.scrollTop - 140));
      } else if (e.key === "Home") {
        e.preventDefault();
        lenis.scrollTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        lenis.scrollTo(scrollContainer.scrollHeight);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWindowWheel);
      scrollContainer.removeEventListener("scroll", handleNativeScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [onScroll]);

  return null;
}

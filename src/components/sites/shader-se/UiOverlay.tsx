"use client";

import React, { useState } from "react";
import Link from "next/link";

interface UiOverlayProps {
  currentSection: string;
  isDark?: boolean;
  onNavigate?: (sectionId: string) => void;
}

const NAV_ITEMS = [
  { id: "hero", label: "HOME" },
  { id: "projects", label: "SELECTED WORK" },
  { id: "about-us", label: "ABOUT US" },
  { id: "contact", label: "CONTACT" },
];

export function UiOverlay({ currentSection, isDark = false, onNavigate }: UiOverlayProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Section label for "Scroll to: ..." indicator
  const getNextSectionLabel = () => {
    switch (currentSection) {
      case "hero":
        return "Selected Work";
      case "projects":
        return "About Us";
      case "office":
      case "about-us":
        return "Golden Tie";
      case "golden-tie":
        return "Contact";
      default:
        return "Home";
    }
  };

  const handleNavClick = (id: string) => {
    setMenuOpen(false);
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById("scroll-container");
      if (el) {
        const height = window.innerHeight;
        let targetScroll = 0;
        if (id === "projects") targetScroll = height * 1.0;
        else if (id === "about-us") targetScroll = height * 3.8;
        else if (id === "contact") targetScroll = height * 18.8;
        el.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    }
  };

  const textColor = isDark ? "text-white" : "text-neutral-900";
  const borderColor = isDark ? "border-white/20" : "border-black/20";

  return (
    <header className="fixed inset-0 pointer-events-none z-50 select-none font-stix">
      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 p-6 md:p-8 flex items-center justify-between pointer-events-auto">
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={() => handleNavClick("hero")}
          className="flex items-center gap-3 cursor-pointer group focus:outline-none"
          aria-label="4CE — Home"
        >
          <div className="w-8 h-8 relative flex items-center justify-center">
            {/* SVG Logo mark */}
            <svg
              viewBox="0 0 100 100"
              className="w-7 h-7 fill-red-600 transition-transform duration-300 group-hover:scale-105"
            >
              <polygon points="50,10 90,90 50,70 10,90" />
            </svg>
          </div>
          <span className={`text-sm md:text-base font-semibold tracking-widest ${textColor}`}>
            4CE
          </span>
        </button>

        {/* Desktop Nav Links */}
        <nav
          className="hidden md:flex items-center gap-8 lg:gap-12"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`text-xs md:text-sm tracking-wider uppercase transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "font-bold text-red-500"
                    : `${textColor} hover:opacity-70`
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA / Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <a
            href="https://cal.com/filip-kantedal-hd30xa/30min"
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs md:text-sm tracking-wider font-medium transition-all duration-300 hover:bg-white/10 ${borderColor} ${textColor}`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            BOOK A CALL
          </a>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-md ${textColor} hover:bg-white/10`}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 stroke-current"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 p-8 flex flex-col justify-between pointer-events-auto backdrop-blur-lg">
          <div className="flex justify-between items-center">
            <span className="text-white text-base font-bold tracking-widest">4CE</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="text-white p-2 text-2xl"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col gap-6 my-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="text-left text-2xl font-serif text-white hover:text-red-400 tracking-wider transition-colors"
              >
                {item.label}
              </button>
            ))}
            <a
              href="https://cal.com/filip-kantedal-hd30xa/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-3 text-red-500 text-lg font-bold"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Book a call
            </a>
          </nav>

          <div className="text-neutral-400 text-xs flex flex-col gap-2 border-t border-neutral-800 pt-6">
            <a href="mailto:contact@studio-labs.dev" className="hover:text-white">
              contact@studio-labs.dev
            </a>
            <p>Worldwide Digital Labs &amp; Production Studio</p>
            <div className="flex gap-4 mt-2">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                GitHub
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                X (Twitter)
              </a>
            </div>
            <Link
              href="/accessibility-statement"
              onClick={() => setMenuOpen(false)}
              className="mt-2 text-neutral-500 hover:text-neutral-300 underline"
            >
              Accessibility Statement
            </Link>
          </div>
        </div>
      )}

      {/* Contextual Narrative Section Overlays */}
      {currentSection === "hero" && (
        <div className="absolute left-8 sm:left-14 md:left-20 lg:left-24 top-1/2 -translate-y-1/2 max-w-lg md:max-w-xl pointer-events-none transition-opacity duration-500">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white/95 leading-[1.12]">
            We make websites and digital experiences that people remember.
          </h1>
          <p className="mt-5 text-xs sm:text-sm md:text-base text-neutral-400 font-sans tracking-wide">
            Award-winning interactive design studio crafting high-end 3D web applications.
          </p>
        </div>
      )}

      {currentSection === "about-us" && (
        <div className="absolute top-28 left-8 sm:left-14 md:left-20 max-w-xl pointer-events-none transition-opacity duration-500 text-neutral-900">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
            [03 — ABOUT US]
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight">
            We are a creative engineering studio specializing in real-time 3D and playful design.
          </h2>
        </div>
      )}

      {currentSection === "golden-tie" && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center pointer-events-none transition-opacity duration-500 text-white w-full px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
            Check Out This Golden Tie
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400 tracking-wider">
            You made it this far. You deserve a tie-break.
          </p>
        </div>
      )}

      {/* Bottom Floating Controls */}
      <div className="absolute bottom-6 md:bottom-8 left-0 right-0 px-6 md:px-8 flex items-center justify-between pointer-events-auto">
        {/* Scroll Indicator */}
        <div className={`text-xs md:text-sm tracking-widest opacity-80 ${textColor}`}>
          Scroll to: <span className="underline italic">{getNextSectionLabel()}</span>
        </div>

        {/* Audio Mute/Unmute Toggle */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2.5 rounded-full border transition-all duration-300 hover:scale-110 ${borderColor} ${textColor}`}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? (
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 fill-current animate-pulse" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}

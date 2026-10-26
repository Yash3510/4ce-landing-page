"use client";

import React from "react";
import Link from "next/link";
import { ShaderCanvas } from "@/components/sites/shader-se/ShaderCanvas";

export default function AccessibilityStatementPage() {
  return (
    <div
      className="fixed inset-0 w-screen overflow-y-auto overflow-x-hidden overscroll-none z-50 touch-pan-y"
      id="scroll-container"
      tabIndex={-1}
    >
      {/* Semantic Accessibility Layer */}
      <div id="a11y-overlay">
        <nav aria-label="Accessibility Statement navigation" className="a11y-hidden">
          <Link href="/">Close accessibility statement</Link>
        </nav>

        <section aria-label="Accessibility Statement" className="a11y-hidden">
          <h1>Statement On Accessibility: Pushing Pixels into the Future</h1>
          <p>
            At Shader, we don&#x27;t just dress for the job we want, complete with aggressive shoulder
            pads and power ties, we build for the future. You&#x27;ve probably noticed that our digital
            real estate isn&#x27;t your standard, flat-file brochure. It is rendered entirely in
            glorious, state-of-the-art WebGPU and WebGL.
          </p>
          <p>
            Why did we bypass the standard document object model to put our entire enterprise on a
            single canvas element? Simple: Because it&#x27;s a paradigm shift. We do web, AI, and 3D
            visualization, and we wanted a corporate homepage that flexes our technical muscles,
            maximizes synergy, and looks incredibly cool doing it.
          </p>
          <p>
            However, the boys down in RnD have informed management of a slight &quot;friction in the
            paradigm.&quot;
          </p>
          <p>
            We know what we are doing when it comes to web accessibility. We are intimately familiar
            with WCAG guidelines, and we believe the web should be open for everyone to do business.
            But pushing pixels into the Z-axis makes standard screen-reader integration and keyboard
            navigation a complex merger.
          </p>
          <p>
            Here is what we&#x27;ve done to bridge the gap between radical 3D innovation and universal
            access:
          </p>
          <ul>
            <li>
              <strong>The Shadow Boardroom::</strong> The Shadow Boardroom: We have engineered hidden
              DOM elements and ARIA labels that operate behind the 3D graphics to communicate with
              assistive technologies.
            </li>
            <li>
              <strong>Executive Keystrokes::</strong> Executive Keystrokes: We&#x27;ve implemented
              custom keyboard navigation to ensure you can tab through our 3D space without needing a
              mouse.
            </li>
            <li>
              <strong>High-Contrast Mindset::</strong> High-Contrast Mindset: Our visual assets are
              designed to pop, keeping legibility in mind even when the camera is panning through
              cyberspace.
            </li>
          </ul>
          <p>
            Despite our best efforts to future-proof this asset, rendering text and interactive
            elements purely to a 3D canvas means it might not behave perfectly with every piece of
            assistive technology on the market. We haven&#x27;t cut corners, we just extruded them
            into the third dimension, but we acknowledge that the experience might not be 100 percent
            seamless for everyone.
          </p>
          <p>
            If our cutting-edge 3D canvas is creating a bottleneck in your workflow or blocking your
            productivity, we want to know about it. At the end of the day, we are in the business of
            delivering results, not digital red tape. Please have your people reach out to our executive
            secretary via the electronic mail system at secretary@shader.se. We will happily fast-track
            a plain-text dossier of our services directly to your inbox, assist you with scoping your
            next project, or just talk shop about the future of AI.
          </p>
          <footer>
            <p>The Management</p>
            <p>
              <strong>Shader Development Studio</strong>
            </p>
            <p>A High Tech Business Solutions Company</p>
          </footer>
        </section>
      </div>

      {/* 3D WebGL Canvas Layer (Accessibility Mode) */}
      <ShaderCanvas scrollProgress={0} subPage="accessibility-statement" />

      {/* Visible Content Overlay on Paper Texture */}
      <div className="fixed inset-0 z-50 pointer-events-auto overflow-y-auto px-6 py-12 md:px-24 md:py-20 flex flex-col max-w-4xl mx-auto text-neutral-900 font-stix">
        {/* Header & Close Button */}
        <div className="flex items-center justify-between pb-8 border-b border-neutral-300">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm font-semibold tracking-widest text-neutral-900"
          >
            <svg viewBox="0 0 100 100" className="w-6 h-6 fill-red-600">
              <polygon points="50,10 90,90 50,70 10,90" />
            </svg>
            SHADER
          </Link>
          <Link
            href="/"
            aria-label="Close accessibility statement"
            className="p-2 text-xl font-bold rounded-full hover:bg-neutral-200/50 transition-colors"
          >
            ✕
          </Link>
        </div>

        {/* Statement Body */}
        <article className="mt-8 space-y-6 text-sm md:text-base leading-relaxed text-neutral-800">
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-neutral-950 mb-6">
            Statement On Accessibility: Pushing Pixels into the Future
          </h1>
          <p>
            At Shader, we don&#x27;t just dress for the job we want, complete with aggressive shoulder
            pads and power ties, we build for the future. You&#x27;ve probably noticed that our digital
            real estate isn&#x27;t your standard, flat-file brochure. It is rendered entirely in
            glorious, state-of-the-art WebGPU and WebGL.
          </p>
          <p>
            Why did we bypass the standard document object model to put our entire enterprise on a
            single canvas element? Simple: Because it&#x27;s a paradigm shift. We do web, AI, and 3D
            visualization, and we wanted a corporate homepage that flexes our technical muscles,
            maximizes synergy, and looks incredibly cool doing it.
          </p>
          <p>
            However, the boys down in RnD have informed management of a slight &quot;friction in the
            paradigm.&quot;
          </p>
          <p>
            We know what we are doing when it comes to web accessibility. We are intimately familiar
            with WCAG guidelines, and we believe the web should be open for everyone to do business.
            But pushing pixels into the Z-axis makes standard screen-reader integration and keyboard
            navigation a complex merger.
          </p>
          <div className="border-l-2 border-red-600 pl-4 py-2 my-6 space-y-3 bg-neutral-100/60 rounded-r">
            <p>
              <strong>The Shadow Boardroom:</strong> We have engineered hidden DOM elements and ARIA
              labels that operate behind the 3D graphics to communicate with assistive technologies.
            </p>
            <p>
              <strong>Executive Keystrokes:</strong> We&#x27;ve implemented custom keyboard navigation
              to ensure you can tab through our 3D space without needing a mouse.
            </p>
            <p>
              <strong>High-Contrast Mindset:</strong> Our visual assets are designed to pop, keeping
              legibility in mind even when the camera is panning through cyberspace.
            </p>
          </div>
          <p>
            Despite our best efforts to future-proof this asset, rendering text and interactive
            elements purely to a 3D canvas means it might not behave perfectly with every piece of
            assistive technology on the market.
          </p>
          <p>
            If our cutting-edge 3D canvas is creating a bottleneck in your workflow, please reach out to
            our executive secretary at{" "}
            <a href="mailto:secretary@shader.se" className="text-red-700 underline font-semibold">
              secretary@shader.se
            </a>
            .
          </p>
          <footer className="pt-8 border-t border-neutral-300 text-xs text-neutral-600 space-y-1">
            <p className="font-semibold text-neutral-900">The Management</p>
            <p>Shader Development Studio</p>
            <p>A High Tech Business Solutions Company</p>
          </footer>
        </article>
      </div>

      <div className="h-canvas-svh w-screen-svw pointer-events-none" />
    </div>
  );
}

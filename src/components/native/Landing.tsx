"use client";

import { useEffect, useRef, useState } from "react";
import "lenis/dist/lenis.css";
import { startEngine } from "@/lib/native/engine";
import { PROJECTS } from "@/lib/shader-se/projects";

const BOOT_SEGMENTS = 20;
const pad = (n: number) => String(n).padStart(2, "0");

export function Landing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(0);
  const [booted, setBooted] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [project, setProject] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const main = mainRef.current;
    if (!canvas || !main) return;
    return startEngine({
      canvas,
      sections: Array.from(main.querySelectorAll<HTMLElement>("[data-stage]")),
      onLoadProgress: setLoaded,
      onReady: (ok) => {
        setWebgl(ok);
        setLoaded(1);
        setBooted(true);
      },
      onProject: setProject,
    });
  }, []);

  const current = PROJECTS[project];

  return (
    <>
      <a href="#content" className="a11y-skip-to-content">
        Skip to content
      </a>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`fixed inset-0 h-svh w-full ${webgl ? "" : "hidden"}`}
      />

      <BootScreen progress={loaded} done={booted} />

      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 mix-blend-difference sm:px-8 sm:py-6">
        <a href="#top" className="text-2xl italic tracking-tight text-[#fcf9f3]">
          4CE
        </a>
        <nav aria-label="Main">
          <ul className="flex gap-5 text-sm tracking-wide text-[#fcf9f3] sm:gap-8 sm:text-base">
            <li><a href="#work" className="nav-link">Work</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main ref={mainRef} id="content" className="relative z-10">
        <section id="top" data-stage="hero" className="h-[220svh]" aria-labelledby="hero-title">
          <div className="sticky top-0 flex h-svh flex-col justify-end px-5 pb-10 sm:px-8 sm:pb-14">
            <h1 id="hero-title" className="max-w-[13ch] text-[clamp(2.5rem,7vw,6rem)] leading-[0.95] text-[#fcf9f3]">
              Creative development studio
            </h1>
            <p className="mt-5 max-w-[34ch] text-base text-[#fcf9f3]/75 sm:text-lg">
              Interactive 3D, WebGL and AI products for brands and agencies.
            </p>
            <p aria-hidden="true" className="mt-10 font-mono text-xs uppercase tracking-[0.3em] text-[#fcf9f3]/50">
              Scroll
            </p>
          </div>
        </section>

        <section id="work" data-stage="work" className="h-[520svh]" aria-labelledby="work-title">
          <div className="sticky top-0 flex h-svh flex-col items-center justify-between px-5 pb-12 pt-24 text-center sm:pb-16 sm:pt-28">
            <h2 id="work-title" className="font-mono text-xs uppercase tracking-[0.3em] text-[#fcf9f3]/70">
              Selected work
            </h2>
            <div aria-live="polite">
              <p className="font-mono text-xs tracking-[0.2em] text-[#fcf9f3]/60">
                {pad(project + 1)} / {pad(PROJECTS.length)}
              </p>
              <p className="mt-2 text-[clamp(1.75rem,4vw,3rem)] leading-tight text-[#fcf9f3]">{current.title}</p>
              <p className="text-sm text-[#fcf9f3]/70">{current.subtitle}</p>
            </div>
          </div>
        </section>

        <section data-stage="office" className="h-[260svh]" aria-label="About us introduction">
          <h2 className="a11y-hidden">About Us</h2>
        </section>

        <section id="about" data-stage="office" className="relative bg-[#f3eee4] text-[#1b1b1b]" aria-labelledby="about-title">
          <div className="relative mx-auto grid max-w-6xl gap-14 px-5 py-28 sm:px-8 md:grid-cols-[1fr_1.4fr] md:py-36">
            <div>
              <h2 id="about-title" className="text-[clamp(2.5rem,6vw,4.5rem)] leading-none">About Us</h2>
              <p className="mt-8 max-w-[38ch] text-lg leading-relaxed text-[#1b1b1b]/80">
                [Placeholder: studio introduction copy to be written.]
              </p>
              <h3 className="mt-12 font-mono text-xs uppercase tracking-[0.25em] text-[#1b1b1b]/60">What we build</h3>
              <ul className="mt-4 space-y-2 text-lg">
                <li>3D showrooms and configurators</li>
                <li>Campaign websites</li>
                <li>AI image and video tools</li>
                <li>AR games</li>
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#1b1b1b]/60">Project index</h3>
              <ol className="mt-4 border-t border-[#222]/15">
                {PROJECTS.map((p, i) => (
                  <li key={p.uid} className="grid grid-cols-[2.5rem_1fr] gap-x-3 border-b border-[#222]/15 py-3 sm:grid-cols-[2.5rem_1fr_auto]">
                    <span className="font-mono text-xs leading-7 text-[#1b1b1b]/50">{pad(i + 1)}</span>
                    <span className="text-lg">{p.title}</span>
                    <span className="col-start-2 text-sm text-[#1b1b1b]/60 sm:col-start-3 sm:text-right sm:leading-7">{p.subtitle}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section data-stage="tie" className="h-[240svh]" aria-labelledby="tie-title">
          <div className="sticky top-0 flex h-svh items-end px-5 pb-12 sm:px-8 sm:pb-16">
            <h2 id="tie-title" className="max-w-[12ch] text-[clamp(2.25rem,6vw,5rem)] leading-[0.95] text-[#f6e3ad]">
              Dressed for the launch.
            </h2>
          </div>
        </section>

        <section id="contact" data-stage="contact" className="h-[200svh]" aria-labelledby="contact-title">
          <div className="sticky top-0 flex h-svh flex-col justify-end px-5 pb-10 sm:px-8 sm:pb-14">
            <h2 id="contact-title" className="text-[clamp(2.5rem,7vw,6rem)] leading-none text-[#fcf9f3]">
              Let&apos;s talk
            </h2>
            <dl className="mt-8 grid max-w-xl grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[#fcf9f3]/80">
              <dt className="font-mono text-xs uppercase leading-7 tracking-[0.2em] text-[#fcf9f3]/50">Email</dt>
              <dd>[Placeholder: contact email]</dd>
              <dt className="font-mono text-xs uppercase leading-7 tracking-[0.2em] text-[#fcf9f3]/50">Phone</dt>
              <dd>[Placeholder: phone number]</dd>
            </dl>
            <p className="mt-12 font-mono text-xs text-[#fcf9f3]/40">© 2026 4CE</p>
          </div>
        </section>
      </main>
    </>
  );
}

function BootScreen({ progress, done }: { progress: number; done: boolean }) {
  const filled = Math.round(progress * BOOT_SEGMENTS);
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={done}
      className={`boot fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#3a3aa8] px-6 text-[#efe7d2] ${done ? "boot-off" : ""}`}
    >
      <div className="flex items-center gap-6 sm:gap-10">
        <span aria-hidden="true" className="boot-stripes h-14 w-24 sm:h-24 sm:w-40" />
        <span className="text-[clamp(4rem,14vw,9rem)] font-bold italic leading-none">4CE</span>
      </div>
      <p className="mt-10 text-center font-mono text-sm sm:text-lg">
        4CE Development Studio, Website
        <br />
        Version 1.0
      </p>
      <div className="mt-16 flex w-full max-w-md gap-1 border-2 border-[#efe7d2] p-1" aria-hidden="true">
        {Array.from({ length: BOOT_SEGMENTS }, (_, i) => (
          <span key={i} className={`h-7 flex-1 ${i < filled ? "bg-[#efe7d2]" : ""}`} />
        ))}
      </div>
      <span className="a11y-hidden">{done ? "Loaded" : `Loading ${Math.round(progress * 100)}%`}</span>
      <p className="absolute bottom-8 px-6 text-center font-mono text-xs sm:text-sm">
        Copyright (c) 4CE Development Studio, 2026. All Rights Reserved.
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import "lenis/dist/lenis.css";
import { startEngine } from "@/lib/native/engine";
import { PROJECTS } from "@/lib/shader-se/projects";

const BOOT_SEGMENTS = 20;
const pad = (n: number) => String(n).padStart(2, "0");

const NAV = [
  { id: "top", label: "Home" },
  { id: "work", label: "Selected Work" },
  { id: "about", label: "About Us" },
  { id: "contact", label: "Contact" },
] as const;
type NavId = (typeof NAV)[number]["id"];

const isNavId = (value: string | undefined): value is NavId => NAV.some((n) => n.id === value);

export function Landing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(0);
  const [booted, setBooted] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [project, setProject] = useState(0);
  const [nav, setNav] = useState<NavId>("top");
  const [light, setLight] = useState(false);

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
      onSection: (el) => {
        if (isNavId(el.dataset.nav)) setNav(el.dataset.nav);
        setLight(el.dataset.theme === "light");
      },
    });
  }, []);

  const current = PROJECTS[project];
  const next = NAV[(NAV.findIndex((n) => n.id === nav) + 1) % NAV.length];

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

      <div className={`chrome ${light ? "chrome-light" : ""}`}>
        <header className="fixed inset-x-0 top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center px-6 pt-6 sm:px-9 sm:pt-9">
          <a href="#top" aria-label="4CE, go to home" className="caps flex items-center gap-3 justify-self-start text-[15px] font-semibold">
            <svg viewBox="0 0 20 20" className="size-5 fill-[var(--accent)]" aria-hidden="true">
              <path d="M10 1 19 19 10 14.5 1 19Z" />
            </svg>
            4CE
          </a>
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex gap-12">
              {NAV.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={nav === item.id ? "location" : undefined}
                    className={`caps nav-link text-[13px] ${nav === item.id ? "text-[var(--accent)]" : ""}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="#contact" className="caps pill flex items-center gap-2 justify-self-end rounded-full px-4 py-2 text-[13px]">
            <span className="size-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            Book a call
          </a>
        </header>

        <p className="fixed bottom-6 left-6 z-30 text-[13px] tracking-[0.08em] sm:bottom-9 sm:left-9">
          Scroll to: <a href={`#${next.id}`} className="italic underline underline-offset-4">{next.label}</a>
        </p>
      </div>

      <main ref={mainRef} id="content" className="relative z-10">
        <section id="top" data-stage="hero" data-nav="top" className="h-[220svh]">
          <h1 className="a11y-hidden">4CE, a creative development studio for interactive 3D, WebGL and AI</h1>
        </section>

        <section id="work" data-stage="work" data-nav="work" className="h-[520svh]" aria-labelledby="work-title">
          <h2 id="work-title" className="a11y-hidden">Selected Work</h2>
          <div className="sticky top-0 flex h-svh flex-col items-center justify-start px-6 pt-28 text-center sm:pt-32">
            <p aria-live="polite" className="text-[#fcf9f3]">
              <span className="block font-mono text-[11px] tracking-[0.2em] text-[#fcf9f3]/60">
                {pad(project + 1)} / {pad(PROJECTS.length)}
              </span>
              <span className="caps mt-2 block text-[14px]">{current.title}</span>
              <span className="block text-[13px] italic text-[#fcf9f3]/70">{current.subtitle}</span>
            </p>
          </div>
        </section>

        <section id="about" data-stage="office" data-nav="about" className="h-[260svh]">
          <h2 className="a11y-hidden">About Us</h2>
        </section>

        <section data-stage="office" data-nav="about" data-theme="light" className="paper relative text-[#1b1b1b]" aria-labelledby="about-title">
          <div className="relative mx-auto max-w-6xl px-6 py-32 sm:px-9 md:py-44">
            <h2 id="about-title" className="text-center text-[clamp(2.75rem,7vw,5.5rem)] leading-none">About Us</h2>
            <p className="mx-auto mt-8 max-w-[44ch] text-center text-lg leading-relaxed text-[#1b1b1b]/75">
              [Placeholder: studio introduction copy to be written.]
            </p>
            <div className="mt-24 grid gap-14 md:grid-cols-[1fr_2fr]">
              <div>
                <h3 className="caps text-[12px] text-[#1b1b1b]/55">What we build</h3>
                <ul className="mt-5 space-y-2 text-lg">
                  <li>3D showrooms and configurators</li>
                  <li>Campaign websites</li>
                  <li>AI image and video tools</li>
                  <li>AR games</li>
                </ul>
              </div>
              <div>
                <h3 className="caps text-[12px] text-[#1b1b1b]/55">Project index</h3>
                <ol className="mt-5 border-t border-[#1b1b1b]/20">
                  {PROJECTS.map((p, i) => (
                    <li key={p.uid} className="grid grid-cols-[2.5rem_1fr] gap-x-3 border-b border-[#1b1b1b]/20 py-3 sm:grid-cols-[2.5rem_1fr_auto]">
                      <span className="font-mono text-[11px] leading-7 text-[#1b1b1b]/45">{pad(i + 1)}</span>
                      <span className="text-lg">{p.title}</span>
                      <span className="col-start-2 text-sm italic text-[#1b1b1b]/60 sm:col-start-3 sm:text-right sm:leading-7">{p.subtitle}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section data-stage="tie" data-nav="about" className="h-[240svh]">
          <h2 className="a11y-hidden">Closed deals</h2>
        </section>

        <section id="contact" data-stage="contact" data-nav="contact" className="h-[200svh]" aria-labelledby="contact-title">
          <div className="sticky top-0 flex h-svh flex-col items-center justify-end px-6 pb-24 text-center text-[#fcf9f3] sm:pb-28">
            <h2 id="contact-title" className="caps text-[13px] text-[#fcf9f3]/70">Contact</h2>
            <p className="mt-3 text-[clamp(1.5rem,3vw,2.25rem)]">[Placeholder: contact email]</p>
            <p className="mt-1 text-[13px] italic text-[#fcf9f3]/70">[Placeholder: phone number]</p>
          </div>
        </section>
      </main>
    </>
  );
}

function BootScreen({ progress, done }: { progress: number; done: boolean }) {
  const filled = Math.round(progress * BOOT_SEGMENTS);
  return (
    <div role="status" aria-live="polite" aria-hidden={done} className={`boot fixed inset-0 z-50 bg-black ${done ? "boot-off" : ""}`}>
      <div className="boot-tube flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-5 sm:gap-8">
          <span aria-hidden="true" className="boot-stripes h-9 w-16 sm:h-20 sm:w-36" />
          <span className="boot-logo text-[clamp(3.5rem,11vw,8.5rem)] font-bold italic leading-none">4CE</span>
        </div>
        <p className="boot-mono mt-8 text-center text-[13px] sm:text-lg">
          4CE Development Studio, Website
          <br />
          Version 1.0
        </p>
        <div className="mt-14 flex w-full max-w-xl gap-[3px] border-2 border-current p-[3px]" aria-hidden="true">
          {Array.from({ length: BOOT_SEGMENTS }, (_, i) => (
            <span key={i} className={`h-6 flex-1 sm:h-8 ${i < filled ? "bg-current" : ""}`} />
          ))}
        </div>
        <span className="a11y-hidden">{done ? "Loaded" : `Loading ${Math.round(progress * 100)}%`}</span>
        <p className="boot-mono absolute bottom-[8%] px-6 text-center text-[11px] sm:text-sm">
          Copyright (c) 4CE Development Studio, 2026. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

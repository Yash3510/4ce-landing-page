"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { ShaderCanvas } from "@/components/sites/shader-se/ShaderCanvas";
import { UiOverlay } from "@/components/sites/shader-se/UiOverlay";
import { LenisController } from "@/components/sites/shader-se/LenisController";

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState("hero");

  const handleScroll = useCallback((progress: number) => {
    setScrollProgress(progress);
  }, []);

  const isDarkSection =
    currentSection === "hero" ||
    currentSection === "projects" ||
    currentSection === "golden-tie";

  return (
    <>
      <div
        className="fixed inset-0 w-screen overflow-y-auto overflow-x-hidden overscroll-none z-50 touch-pan-y"
        id="scroll-container"
        tabIndex={-1}
      >
        {/* Semantic Accessibility Layer */}
        <div id="a11y-overlay">
          <button type="button" className="a11y-skip-to-content">
            Skip to content
          </button>
          <nav aria-label="Main navigation" className="a11y-hidden">
            <button type="button" aria-label="Shader logo, go to home page">
              Shader — Home
            </button>
            <ul>
              <li>
                <button type="button" aria-label="Navigate to Home section">
                  Home
                </button>
              </li>
              <li>
                <button type="button" aria-label="Navigate to Selected Work section">
                  Selected Work
                </button>
              </li>
              <li>
                <button type="button" aria-label="Navigate to About Us section">
                  About Us
                </button>
              </li>
              <li>
                <button type="button" aria-label="Navigate to Contact section">
                  Contact
                </button>
              </li>
            </ul>
            <a
              href="https://cal.com/filip-kantedal-hd30xa/30min"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Book a call on Cal.com, opens in new tab"
            >
              Book a call
            </a>
          </nav>

          <section aria-label="Hero" className="a11y-hidden">
            <h1>A Creative Development Studio, Plugged into the Future</h1>
            <p>Scroll to Inspect Our Closed Deals</p>
          </section>

          <section aria-label="Selected Work" className="a11y-hidden">
            <h2>Selected Work</h2>
            <p>Browse our project carousel to explore our selected work.</p>
            <fieldset>
              <legend>Project carousel</legend>
              <button type="button" aria-label="Go to previous project in carousel">
                Previous project
              </button>
              <button type="button" aria-live="polite">
                View project: <span></span> <span></span>
              </button>
              <button type="button" aria-label="Go to next project in carousel">
                Next project
              </button>
            </fieldset>
          </section>

          <section aria-label="About Us" className="a11y-hidden">
            <h2>Making Digital Storytelling More Playful, Powerful, and Alive</h2>
            <p>
              Shader is a creative development studio specialized in building interactive 3D and AI
              solutions for the web. Serious about business, based in Sweden, and working with
              brands, agencies and designers worldwide.
            </p>
            <p>
              Plugged into the future. While we&#x27;re a small team of creative engineers, we have a
              hand-picked network of collaborators: designers, 3D artists, copywriters, animators, and
              creative technologists, ready to plug in with an array of capabilities.
            </p>
            <p>
              This modular approach means we can scale and adapt to each challenge. Whether
              it&#x27;s a WebGL experiment, an interactive product visualization, a mobile app, or an
              AI-driven experience, we help bold brands stand out across every screen.
            </p>
            <p>
              We build storytelling platforms that demand attention and reward curiosity. We push
              digital mediums to places you haven&#x27;t seen before, and have fun doing it. Beyond
              code, we offer 3D design and animation, UI and motion design, concepts and digital
              strategy, full-stack development, and creative consulting.
            </p>
            <p>
              Whether it&#x27;s prototyping an idea, launching an augmented reality experience, or
              bringing high-fidelity visuals to life, Shader bridges the gap between creative ambition
              and technical execution. Our process is hands-on, collaborative, and tailored for teams
              that value both craft and innovation. We combine technical expertise with a
              designer&#x27;s eye, ensuring that every interaction feels natural and every pixel is
              perfectly placed. We&#x27;re not your regular IT department. We don&#x27;t troubleshoot
              printers.
            </p>
            <p>
              We have had the benefit of working with a large pool of great clients throughout the
              years. Our partnerships ranges from some of the most recognizable Swedish brands to
              international innovators.
            </p>
            <p>
              In today&#x27;s fast-paced corporate landscape, you need a partner who understands the
              bottom line. At Shader, we engineer success through strategic alliances and mutual
              profitability. Our team is ready to synergize with your organization, unlock new
              verticals, and maximize your digital ROI. We don&#x27;t just close deals; we deliver
              results that compound.
            </p>
            <p>
              We leverage state-of-the-art technology to give your brand a decisive competitive
              advantage. Whether disrupting the market with paradigm-shifting 3D experiences or
              streamlining operations with cutting-edge AI, we provide turnkey solutions that scale.
              We merge high-performance engineering with executive-level design to build assets that
              appreciate your brand value.
            </p>
            <p>
              Ready to take your enterprise to the next level? Don&#x27;t waste valuable time. Review
              our portfolio, crunch the numbers, and you&#x27;ll see the trajectory points one way: up.
              Pick up the phone, send a fax, or schedule a consultation. The future of your business
              is waiting. Let&#x27;s execute.
            </p>
            <a
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Book a call with Shader on Cal.com, opens in new tab"
              href="https://cal.com/filip-kantedal-hd30xa/30min"
            >
              Book a Call Today
            </a>
          </section>

          <section aria-label="Contact" className="a11y-hidden">
            <h2>Contact</h2>
            <p>
              Contact us about your digital project idea or general enquires. Let&#x27;s interface,
              call us today!
            </p>
            <fieldset>
              <legend>General Enquiries</legend>
              <a aria-label="Send email to hello@shader.se" href="mailto:hello@shader.se">
                hello@shader.se
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Book a call on Cal.com, opens in new tab"
                href="https://cal.com/filip-kantedal-hd30xa/30min"
              >
                Book a call
              </a>
            </fieldset>
            <fieldset>
              <legend>Visit us</legend>
              <address aria-label="Office address">
                Laxholmstorget 3<br />
                602 21 Norrköping<br />
                Sweden
              </address>
            </fieldset>
            <fieldset>
              <legend>Social</legend>
              <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shader on LinkedIn, opens in new tab"
                href="https://www.linkedin.com/company/shadersweden/"
              >
                LinkedIn
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shader on Instagram, opens in new tab"
                href="https://www.instagram.com/shadersweden/"
              >
                Instagram
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shader on X (Twitter), opens in new tab"
                href="https://x.com/shadersweden"
              >
                X (Twitter)
              </a>
            </fieldset>
            <fieldset>
              <legend>New business</legend>
              <p>
                <a
                  aria-label="Send email to ceo@shader.se"
                  href="mailto:ceo@shader.se"
                >
                  Reach out today to our CEO for new business enquiries at ceo@shader.se
                </a>
              </p>
            </fieldset>
            <fieldset>
              <legend>Footer</legend>
              <Link href="/accessibility-statement">Accessibility Statement</Link>
            </fieldset>
          </section>
        </div>

        {/* 3D WebGL Canvas Layer */}
        <ShaderCanvas
          scrollProgress={scrollProgress}
          onSectionChange={setCurrentSection}
        />

        {/* Scroll Height Spacer */}
        <div className="h-canvas-svh w-screen-svw pointer-events-none" />
      </div>

      {/* Lenis Smooth Scroll Controller */}
      <LenisController onScroll={handleScroll} />

      {/* Visible Interactive UI Overlay */}
      <UiOverlay currentSection={currentSection} isDark={isDarkSection} />
    </>
  );
}

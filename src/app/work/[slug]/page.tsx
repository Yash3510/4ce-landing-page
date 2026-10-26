import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PROJECTS, getProjectBySlug } from "@/lib/shader-se/projects";
import { ShaderCanvas } from "@/components/sites/shader-se/ShaderCanvas";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({
    slug: p.uid,
  }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // Find next project in circular list
  const currentIndex = PROJECTS.findIndex((p) => p.uid === slug);
  const nextProject = PROJECTS[(currentIndex + 1) % PROJECTS.length];

  return (
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
          <Link href="/">Shader — Home</Link>
          <Link href="/">Back to projects</Link>
        </nav>
        <section aria-label="Project details" className="a11y-hidden">
          <h1>{project.title}</h1>
          <p>{project.description}</p>
          {project.site_link?.url && (
            <a
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${project.title} website, opens in new tab`}
              href={project.site_link.url}
            >
              Visit site
            </a>
          )}
          <div>
            <h2>Next Project</h2>
            <p>{nextProject.title}</p>
            <p>{nextProject.subtitle}</p>
            <Link
              type="button"
              aria-label={`Continue to next project: ${nextProject.title}`}
              href={`/work/${nextProject.uid}`}
            >
              Continue
            </Link>
          </div>
        </section>
      </div>

      {/* 3D WebGL Canvas Background */}
      <ShaderCanvas scrollProgress={0} subPage="project" />

      {/* Visible Project Modal Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-auto overflow-y-auto px-6 py-12 md:px-20 md:py-16 flex flex-col max-w-5xl mx-auto text-white font-stix backdrop-blur-sm bg-black/60">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-8 border-b border-neutral-800">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-widest text-white">
            <svg viewBox="0 0 100 100" className="w-6 h-6 fill-red-600">
              <polygon points="50,10 90,90 50,70 10,90" />
            </svg>
            SHADER
          </Link>
          <Link
            href="/"
            aria-label="Back to projects"
            className="text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border border-neutral-700 hover:bg-white/10 transition-colors"
          >
            Back to projects ✕
          </Link>
        </div>

        {/* Project Header */}
        <div className="mt-10 mb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-xs tracking-widest uppercase text-red-500 font-semibold">
            <span>{project.subtitle}</span>
            {project.collaborator && (
              <span className="text-neutral-400">
                • In collaboration with {project.collaborator}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
            {project.title}
          </h1>
          <p className="text-sm md:text-base text-neutral-300 max-w-3xl leading-relaxed pt-2">
            {project.description}
          </p>
          {project.site_link?.url && (
            <div className="pt-4">
              <a
                href={project.site_link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-neutral-200 transition-colors"
              >
                Visit Site ↗
              </a>
            </div>
          )}
        </div>

        {/* Media Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          {project.project_media.map((media, idx) => (
            <div
              key={idx}
              className="relative aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 group"
            >
              <Image
                src={`/api/mux-image/${media.mux_playback_id}/w800-h600-fpreserve`}
                alt={`${project.title} screenshot ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>

        {/* Next Project Footer */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-neutral-400">Next Project</span>
            <p className="text-xl font-bold font-serif text-white">{nextProject.title}</p>
            <p className="text-xs text-neutral-400">{nextProject.subtitle}</p>
          </div>
          <Link
            href={`/work/${nextProject.uid}`}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-neutral-700 text-xs tracking-wider uppercase hover:bg-white/10 transition-colors w-fit"
          >
            Continue to next project →
          </Link>
        </div>
      </div>

      <div className="h-canvas-svh w-screen-svw pointer-events-none" />
    </div>
  );
}

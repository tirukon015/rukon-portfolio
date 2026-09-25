import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, Building2, User, Layers } from "lucide-react";
import { Tag } from "@/components/ui/tag";
import { ProjectMark } from "@/components/ui/project-mark";
import type { Project } from "@/content/projects";

type HRProjectCardProps = {
  project: Project;
  articleCount?: number;
};

/**
 * Level 1: Short HR-friendly Project Overview (The Hook).
 *
 * Designed to be scanned in 10-20 seconds by an HR recruiter or hiring manager:
 * - What is this? (Name, Category, One-line value proposition)
 * - What was the role and context? (Role, Client/Organization)
 * - What are the practical/business impacts? (5 eye-catching, scannable bullet points)
 * - What technologies were used? (Clean tech stack list)
 * - Clear CTA to the full technical case study.
 */
export function HRProjectCard({ project, articleCount }: HRProjectCardProps) {
  const { hrOverview } = project;
  const href = `/work/${project.slug}`;

  return (
    <article
      aria-labelledby={`card-title-${project.slug}`}
      className="group relative flex h-full flex-col rounded-2xl border border-border bg-bg-elevated p-6 sm:p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:border-border-strong hover:shadow-lg"
    >
      {/* Header bar: Category, Confidentiality / Tier, and Project Mark */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-accent">
            <Layers size={12} className="shrink-0" />
            {project.category}
          </span>

          {project.confidential ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-border-strong px-2 py-0.5 font-mono text-[11px] text-text-faint">
              <Lock size={11} className="shrink-0" /> NDA-Safe
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-text-faint">
              {project.period}
            </span>
          )}

          {project.kind !== "professional" && (
            <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-text-faint">
              {project.kind === "university-project" ? "University Project" : "Personal Project"}
            </span>
          )}
        </div>

        <div className="flex h-8 items-center">
          <ProjectMark
            project={project}
            width={120}
            height={32}
            className="h-6 w-auto object-contain object-right opacity-80 transition-opacity group-hover:opacity-100"
            fallbackClassName="font-mono text-sm font-semibold tracking-tight text-text-faint"
          />
        </div>
      </div>

      {/* Thumbnail: the real application, when the project provides one */}
      {project.previewFigure ? (
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="mt-5 block overflow-hidden rounded-xl border border-border bg-bg"
        >
          <Image
            src={project.previewFigure.src}
            alt=""
            width={project.previewFigure.width}
            height={project.previewFigure.height}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="aspect-[16/10] h-auto w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.015]"
          />
        </Link>
      ) : null}

      {/* Title & Value Proposition */}
      <div className="mt-5">
        <h2 id={`card-title-${project.slug}`} className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          <Link href={href} className="transition-colors hover:text-accent-strong">
            {project.name}
          </Link>
        </h2>
        <p className="mt-1 font-mono text-xs text-text-faint">{project.fullName}</p>

        {/* 1-Line Value Proposition Hook */}
        <div className="mt-3.5 rounded-xl border border-accent/20 bg-accent/[0.04] p-3.5 text-sm font-medium leading-relaxed text-text">
          {hrOverview.valueProposition}
        </div>
      </div>

      {/* Role & Context Meta */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 rounded-xl border border-border/60 bg-bg/50 p-3 sm:grid-cols-2 text-xs">
        <div className="flex items-start gap-2">
          <User size={13} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-text-faint">Role</span>
            <span className="font-semibold text-text">{hrOverview.role}</span>
            {hrOverview.roleScope && (
              <span className="block text-[11px] leading-tight text-text-muted mt-0.5">
                {hrOverview.roleScope}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Building2 size={13} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-text-faint">Context</span>
            <span className="text-text-muted">{hrOverview.context}</span>
          </div>
        </div>
      </div>

      {/* Key Highlights (Value Bullets) */}
      <div className="mt-5 flex-1">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">
          Key Highlights
        </h3>
        <ul className="mt-3 flex flex-col gap-2.5">
          {hrOverview.highlights.slice(0, 5).map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-text-muted">
              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tech Stack */}
      <div className="mt-6 border-t border-border pt-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-text-faint mb-2">
          Technologies & Tools
        </div>
        <div className="flex flex-wrap gap-1.5">
          {hrOverview.technologies.slice(0, 6).map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
          {hrOverview.technologies.length > 6 && (
            <span className="inline-flex items-center px-2 py-0.5 font-mono text-[11px] text-text-faint">
              +{hrOverview.technologies.length - 6} more
            </span>
          )}
        </div>
      </div>

      {/* Footer CTA: View Case Study */}
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-4">
        <div className="text-xs text-text-faint">
          {articleCount && articleCount > 0 ? (
            <span>
              {articleCount} related {articleCount === 1 ? "article" : "articles"}
            </span>
          ) : (
            <span>{project.affiliation}</span>
          )}
        </div>

        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-lg bg-text px-4 py-2 text-xs font-semibold text-bg transition-all hover:bg-accent-strong hover:text-white"
        >
          <span>View Case Study</span>
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

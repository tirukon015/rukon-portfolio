import { Layers, Clock, User, Building2 } from "lucide-react";
import { Tag } from "@/components/ui/tag";
import type { UpcomingProject } from "@/content/projects";

type UpcomingProjectCardProps = {
  project: UpcomingProject;
};

/**
 * Level 1: In-progress / upcoming project card.
 *
 * Keeps categories like iOS / Mobile and Web Apps intentional and informative
 * while work is actively being developed.
 */
export function UpcomingProjectCard({ project }: UpcomingProjectCardProps) {
  return (
    <article
      aria-labelledby={`upcoming-${project.slug}`}
      className="relative flex h-full flex-col rounded-2xl border border-dashed border-border-strong bg-bg-elevated/60 p-6 sm:p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:border-accent/40"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-accent">
            <Layers size={12} className="shrink-0" />
            {project.category}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-amber-400">
            <Clock size={11} className="shrink-0" /> {project.status}
          </span>
        </div>

        <span className="font-mono text-xs text-text-faint">Case Study in progress</span>
      </div>

      {/* Title & Value Proposition */}
      <div className="mt-5">
        <h2 id={`upcoming-${project.slug}`} className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          {project.name}
        </h2>
        <div className="mt-3.5 rounded-xl border border-border/80 bg-bg/50 p-3.5 text-sm font-medium leading-relaxed text-text-muted">
          {project.valueProposition}
        </div>
      </div>

      {/* Role & Context Meta */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 rounded-xl border border-border/60 bg-bg/50 p-3 sm:grid-cols-2 text-xs">
        <div className="flex items-start gap-2">
          <User size={13} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-text-faint">Role</span>
            <span className="font-medium text-text">{project.role}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Building2 size={13} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-text-faint">Context</span>
            <span className="text-text-muted">{project.context}</span>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="mt-5 flex-1">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">
          Planned Highlights
        </h3>
        <ul className="mt-3 flex flex-col gap-2.5">
          {project.highlights.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-text-muted">
              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" aria-hidden="true" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tech Stack */}
      <div className="mt-6 border-t border-border pt-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-text-faint mb-2">
          Technologies
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-text-faint">
        <span>In active local development</span>
        <span className="font-mono text-[11px] text-accent">Write-up coming soon</span>
      </div>
    </article>
  );
}
